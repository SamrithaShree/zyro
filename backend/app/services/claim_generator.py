"""
services/claim_generator.py — ClaimGenerator.

Pipeline step 4:
    ClaimGenerator.create_and_route_claim(event, worker)
    → Claim (stored in session.claims)

Responsibilities:
  - Idempotency: one claim per (worker_id, event_id)
  - Fetch active policy
  - Run WIVE validation
  - Compute payout (hourly_benefit × hours × severity_factor × trust_multiplier)
  - Compute fraud score via ML → confidence_score = 1 - anomaly_score
  - Confidence lane routing: HIGH / MEDIUM / REVIEW
  - Enforce financial constraints
  - Persist claim atomically
"""

import logging
import uuid
from datetime import datetime
from typing import List, Optional

from app.db import session
from app.models.domain import (
    Claim,
    ClaimStatus,
    Event,
    ImpactReasoning,
    Policy,
    ValidationBreakdown,
    Worker,
)
from app.services.ml.fraud_scorer import compute_fraud_score
from app.services.ml.trust_model import compute_trust_multiplier
from app.services.ml.risk_model import compute_risk_score
from app.services.wive import WIVE

logger = logging.getLogger(__name__)

# ── Financial constraints ──────────────────────────────────────────────────────
SEVERITY_FACTOR_MIN: float = 1.0
SEVERITY_FACTOR_MAX: float = 1.5
TRUST_MULTIPLIER_MIN: float = 0.85
TRUST_MULTIPLIER_MAX: float = 1.2

# ── Confidence lane thresholds (derived from anomaly_score spec) ─────────────
# Spec: anomaly_score < 0.30 → HIGH  (confidence_score > 0.70)
#       anomaly_score < 0.70 → MEDIUM (confidence_score > 0.30)
#       anomaly_score ≥ 0.70 → REVIEW (confidence_score ≤ 0.30)
HIGH_CONFIDENCE_THRESHOLD: float = 0.70     # anomaly_score < 0.30
MEDIUM_CONFIDENCE_THRESHOLD: float = 0.30   # anomaly_score < 0.70


class ClaimGenerator:
    """
    Idempotent, fraud-aware claim creation with confidence lane routing.
    """

    @staticmethod
    def create_and_route_claim(
        event: Event,
        worker: Worker,
    ) -> Claim:
        """
        Main entry point: creates (or retrieves existing) claim for a worker-event pair.

        Idempotency:
            If a claim for (worker_id, event_id) already exists → return it unchanged.

        Returns:
            Claim domain model (already persisted in session.claims)
        """
        # ── Idempotency Check ─────────────────────────────────────────────────
        existing = ClaimGenerator._find_existing_claim(worker.worker_id, event.event_id)
        if existing:
            logger.info(
                "ClaimGenerator: idempotency hit — returning existing claim %s "
                "for worker=%s event=%s",
                existing.claim_id, worker.worker_id, event.event_id,
            )
            return existing

        # ── Fetch Active Policy ───────────────────────────────────────────────
        active_policy = ClaimGenerator._get_active_policy(worker.worker_id)

        # ── WIVE Validation ───────────────────────────────────────────────────
        wive_result = WIVE.validate_worker_eligibility(
            worker=worker,
            event=event,
            policy=active_policy,
        )

        # ── Payout Calculation ────────────────────────────────────────────────
        is_eligible = wive_result.eligible

        raw_payout = 0
        final_payout = 0
        estimated_loss = 0
        protection_ratio = 0.0
        uncovered_loss = 0
        severity_factor = ClaimGenerator._severity_factor(event.severity)
        trust_multiplier = 1.0
        risk_score = 0.0

        if is_eligible and active_policy:
            impacted_hours = wive_result.impact_reasoning.final_impacted_hours

            # Trust multiplier (Bayesian, clamped)
            account_age_days = max(
                (datetime.utcnow() - worker.created_at).days, 0
            )
            raw_trust = compute_trust_multiplier(worker.worker_id, account_age_days)
            trust_multiplier = ClaimGenerator._clamp_trust(raw_trust)

            raw_payout = int(
                active_policy.hourly_benefit
                * impacted_hours
                * severity_factor
                * trust_multiplier
            )
            # Cap at remaining weekly cap
            final_payout = min(raw_payout, active_policy.remaining_cap)

            # Estimated loss
            weekly_hours = max(active_policy.working_hours_snapshot, 1)
            estimated_loss = int(
                active_policy.income_estimate_snapshot
                * (impacted_hours / weekly_hours)
            )
            protection_ratio = (
                round(final_payout / estimated_loss, 4) if estimated_loss > 0 else 1.0
            )
            uncovered_loss = max(estimated_loss - final_payout, 0)

        # Risk score snapshot (ML, fallback ok)
        try:
            risk_score, _, _ = compute_risk_score(
                worker.model_dump(), worker.zone or ""
            )
        except Exception:
            risk_score = 0.5

        # ── Fraud Scoring → Confidence Lane ──────────────────────────────────
        try:
            anomaly_score = compute_fraud_score(worker, event)
        except Exception as exc:
            logger.warning("ClaimGenerator: fraud score failed: %s — defaulting 0.25", exc)
            anomaly_score = 0.25

        confidence_score = round(1.0 - anomaly_score, 4)
        confidence_lane = ClaimGenerator._route_confidence(confidence_score)

        # ── Build Claim Status ────────────────────────────────────────────────
        if is_eligible:
            status = ClaimStatus.ELIGIBLE
            trust_msg = ""
            if trust_multiplier > 1.0:
                trust_msg = f" Trust bonus applied (+{trust_multiplier:.2f}×)."
            elif trust_multiplier < 1.0:
                trust_msg = f" Trust adjustment applied ({trust_multiplier:.2f}×) for new account."

            explanation = (
                f"You lost ~{wive_result.impact_reasoning.final_impacted_hours}h "
                f"due to {event.trigger_type.value} in {event.zone}. "
                f"Payout: ₹{active_policy.hourly_benefit}/hr × severity {severity_factor:.2f}.{trust_msg}"
            )
            why_eligible = (
                f"Active {active_policy.tier} policy covering {event.trigger_type.value} "
                f"in zone {event.zone}."
            )
            rejection_reason = None
        else:
            status = ClaimStatus.REJECTED
            explanation = (
                f"Claim rejected: {wive_result.rejection_reason}"
            )
            why_eligible = None
            rejection_reason = wive_result.rejection_reason

        # ── Persist Claim ─────────────────────────────────────────────────────
        claim_id = f"clm_{uuid.uuid4().hex[:10]}"
        impacted_hours_val = wive_result.impact_reasoning.final_impacted_hours

        claim = Claim(
            claim_id=claim_id,
            event_id=event.event_id,
            worker_id=worker.worker_id,
            policy_id=active_policy.policy_id if active_policy else "NONE",
            status=status,
            impacted_hours=impacted_hours_val,
            severity_factor=severity_factor,
            trust_multiplier=trust_multiplier,
            trust_multiplier_used=trust_multiplier,
            raw_payout=raw_payout,
            final_payout=final_payout,
            estimated_loss=estimated_loss,
            protection_ratio=protection_ratio,
            uncovered_loss=uncovered_loss,
            explanation=explanation,
            why_eligible=why_eligible,
            rejection_reason=rejection_reason,
            validation_breakdown=wive_result.breakdown,
            impact_reasoning=wive_result.impact_reasoning,
            confidence_score=confidence_score,
            confidence_lane=confidence_lane,
            risk_score_snapshot=risk_score,
        )

        with session.db_lock:
            session.claims[claim_id] = claim

        logger.info(
            "ClaimGenerator: created claim %s worker=%s event=%s status=%s lane=%s payout=₹%d",
            claim_id, worker.worker_id, event.event_id,
            status.value, confidence_lane, final_payout,
        )

        return claim

    @staticmethod
    def create_claims_for_event(event: Event) -> List[Claim]:
        """
        Batch entry point: process ALL workers in event zone.
        Called by EventGenerationEngine pipeline (background task).
        Returns list of all created/existing claims.
        """
        with session.db_lock:
            all_workers = list(session.workers.values())

        claims: List[Claim] = []
        for wd in all_workers:
            w = wd if isinstance(wd, Worker) else Worker(**wd)
            if w.zone != event.zone:
                continue
            try:
                claim = ClaimGenerator.create_and_route_claim(event=event, worker=w)
                claims.append(claim)
            except Exception as exc:
                logger.error(
                    "ClaimGenerator: failed for worker=%s event=%s: %s",
                    w.worker_id, event.event_id, exc,
                )

        logger.info(
            "ClaimGenerator: batch complete for event=%s — %d claims processed",
            event.event_id, len(claims),
        )
        return claims

    # ── Private helpers ───────────────────────────────────────────────────────

    @staticmethod
    def _find_existing_claim(worker_id: str, event_id: str) -> Optional[Claim]:
        with session.db_lock:
            for cd in session.claims.values():
                c = cd if isinstance(cd, Claim) else Claim(**cd)
                if c.worker_id == worker_id and c.event_id == event_id:
                    return c
        return None

    @staticmethod
    def _get_active_policy(worker_id: str) -> Optional[Policy]:
        now = datetime.utcnow()
        with session.db_lock:
            for pd in session.policies.values():
                p = pd if isinstance(pd, Policy) else Policy(**pd)
                if (
                    p.worker_id == worker_id
                    and p.status == "ACTIVE"
                    and p.valid_from <= now <= p.valid_until
                ):
                    return p
        return None

    @staticmethod
    def _severity_factor(severity: float) -> float:
        """Clamp severity to [1.0, 1.5] per financial rules."""
        return round(min(max(severity, SEVERITY_FACTOR_MIN), SEVERITY_FACTOR_MAX), 4)

    @staticmethod
    def _clamp_trust(raw: float) -> float:
        """Clamp trust multiplier to [0.85, 1.2] per financial rules."""
        return round(min(max(raw, TRUST_MULTIPLIER_MIN), TRUST_MULTIPLIER_MAX), 4)

    @staticmethod
    def _route_confidence(confidence_score: float) -> str:
        """
        Confidence lane routing (spec-aligned via anomaly_score):
            anomaly_score < 0.30  (confidence > 0.70)  → HIGH   (auto-payout immediately)
            anomaly_score < 0.70  (confidence > 0.30)  → MEDIUM (deferred 2-4h batch)
            anomaly_score ≥ 0.70  (confidence ≤ 0.30)  → REVIEW (manual 24h queue)
        """
        if confidence_score > HIGH_CONFIDENCE_THRESHOLD:
            return "HIGH"
        elif confidence_score > MEDIUM_CONFIDENCE_THRESHOLD:
            return "MEDIUM"
        else:
            return "REVIEW"
