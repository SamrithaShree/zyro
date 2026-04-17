"""
services/wive.py — Worker Intent Verification Engine (WIVE).

Pipeline step 3:
    WIVE.validate_worker_eligibility(worker, event, policy)
    → WIVEResult(eligible, breakdown, impact_hours)

Four sub-checks:
    1. Zone match          — worker.zone == event.zone
    2. Active policy       — policy exists, is ACTIVE, and valid_until > now
    3. Session overlap     — shift hours overlap with event time (heuristic)
    4. Earning intent      — classify_activity() ML call, falls back to True
"""

import logging
import random
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from app.models.domain import (
    Event,
    Policy,
    ValidationBreakdown,
    ImpactReasoning,
    Worker,
)
from app.services.ml.activity_classifier import has_earning_intent

logger = logging.getLogger(__name__)

# Trigger-type → normalized coverage token (must match policy.covered_triggers)
TRIGGER_COVERAGE_MAP: dict[str, str] = {
    "HEAVY_RAIN": "RAIN",
    "TRAFFIC_DISRUPTION": "TRAFFIC",
    "SEVERE_AQI": "AIR_QUALITY",
    "EXTREME_HEAT": "HEAT",
    "PLATFORM_DOWNTIME": "PLATFORM_DOWNTIME",
}

# Default assumed event duration for payout calculation (hours)
DEFAULT_EVENT_DURATION_HOURS: float = 4.0


@dataclass
class WIVEResult:
    eligible: bool
    breakdown: ValidationBreakdown
    impact_reasoning: ImpactReasoning
    rejection_reason: Optional[str]


class WIVE:
    """
    Worker Intent Verification Engine.

    validate_worker_eligibility is the primary entry point for the pipeline.
    Can also be called directly from the admin /claims/create endpoint.
    """

    @staticmethod
    def validate_worker_eligibility(
        worker: Worker,
        event: Event,
        policy: Optional[Policy],
    ) -> WIVEResult:
        """
        Run the full four-check eligibility validation for a worker-event pair.

        Args:
            worker:  Worker domain model
            event:   Active Event domain model
            policy:  Worker's active Policy (or None if not found)

        Returns:
            WIVEResult
        """
        breakdown = ValidationBreakdown()
        rejection_reason: Optional[str] = None

        # ── Check 1: Zone match ───────────────────────────────────────────────
        if worker.zone == event.zone:
            breakdown.zone_match = True
        else:
            rejection_reason = (
                f"Worker zone '{worker.zone}' does not match event zone '{event.zone}'."
            )
            logger.debug("WIVE zone_match FAIL worker=%s", worker.worker_id)
            return WIVEResult(
                eligible=False,
                breakdown=breakdown,
                impact_reasoning=ImpactReasoning(),
                rejection_reason=rejection_reason,
            )

        # ── Check 2: Active policy with validity window ───────────────────────
        now = datetime.utcnow()

        if policy is None:
            rejection_reason = "No active Zyro policy found for worker."
        elif policy.status != "ACTIVE":
            rejection_reason = f"Policy {policy.policy_id} is not active (status={policy.status})."
        elif not (policy.valid_from <= now <= policy.valid_until):
            rejection_reason = "Event occurred outside the policy validity window."
        else:
            breakdown.policy_active = True
            breakdown.within_policy_window = True

            # Check trigger coverage
            trigger_token = TRIGGER_COVERAGE_MAP.get(
                event.trigger_type.value, event.trigger_type.value
            )
            if trigger_token in policy.covered_triggers:
                breakdown.trigger_covered = True
            else:
                breakdown.trigger_covered = False
                rejection_reason = (
                    f"Your policy ({policy.tier}) does not cover "
                    f"'{trigger_token}' (trigger: {event.trigger_type.value})."
                )

        if rejection_reason and not breakdown.trigger_covered:
            logger.debug("WIVE policy check FAIL worker=%s reason=%s", worker.worker_id, rejection_reason)
            return WIVEResult(
                eligible=False,
                breakdown=breakdown,
                impact_reasoning=ImpactReasoning(),
                rejection_reason=rejection_reason,
            )

        # ── Check 3: Session / shift overlap (heuristic) ──────────────────────
        # Real system: compare GPS session timestamps against event.start_time
        # Hackathon: assume event occurs during typical shift window
        event_duration = DEFAULT_EVENT_DURATION_HOURS
        overlap_factor = min(event_duration / max(worker.working_hours_per_day, 1), 1.0)
        base_impact = worker.working_hours_per_day * overlap_factor

        # ±10% realistic variance
        variation = base_impact * random.uniform(-0.10, 0.10)
        final_impact = round(min(base_impact + variation, event_duration), 2)
        final_impact = max(final_impact, 0.5)   # Minimum detectable impact

        breakdown.working_hours_overlap = final_impact > 0

        # ── Check 4: Earning intent (ML, fallback-safe) ───────────────────────
        # classify_activity returns: active_delivery | waiting | stationary | uncertain
        # "uncertain" means ML couldn't decide — we treat this as PASS (benefit of doubt)
        # Only "stationary" is a hard rejection signal
        try:
            from app.services.ml.activity_classifier import classify_activity
            activity_label = classify_activity(sensor_payload=None)
        except Exception as exc:
            logger.warning("WIVE earning_intent ML failed: %s — defaulting active", exc)
            activity_label = "active_delivery"

        intent = activity_label != "stationary"
        breakdown.earning_intent_detected = intent

        if not intent:
            rejection_reason = "Earning intent not detected: worker classified as stationary during event window."
            logger.debug("WIVE earning_intent FAIL (stationary) worker=%s", worker.worker_id)
            return WIVEResult(
                eligible=False,
                breakdown=breakdown,
                impact_reasoning=ImpactReasoning(
                    event_duration_hours=event_duration,
                    overlap_with_work_hours=base_impact,
                    final_impacted_hours=0.0,
                ),
                rejection_reason=rejection_reason,
            )

        # ── All checks passed ─────────────────────────────────────────────────
        impact_reasoning = ImpactReasoning(
            event_duration_hours=event_duration,
            overlap_with_work_hours=base_impact,
            final_impacted_hours=final_impact,
        )

        logger.info(
            "WIVE ELIGIBLE worker=%s event=%s impact=%.2fh",
            worker.worker_id, event.event_id, final_impact,
        )
        return WIVEResult(
            eligible=True,
            breakdown=breakdown,
            impact_reasoning=impact_reasoning,
            rejection_reason=None,
        )
