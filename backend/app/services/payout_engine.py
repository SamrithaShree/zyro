"""
services/payout_engine.py — PayoutEngine.

Pipeline step 5 (final):
    PayoutEngine.execute_payout(claim_id)
    → PayoutTransaction

Guarantees:
  - Idempotency: idempotency_key = worker_id:event_id:week_id
  - Redis-backed (in-memory fallback when Redis unavailable)
  - Atomically updates claim.status = PAID and policy.remaining_cap
  - Returns full transaction details for API response

  execute_batch_payouts(claims, batch_size=200)
  → Batch HIGH-lane claims, respecting batch size limit
"""

import logging
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Optional

from app.db import session
from app.models.domain import Claim, ClaimStatus, Policy, Worker

logger = logging.getLogger(__name__)

BATCH_SIZE = 200


# ──────────────────────────────────────────────────────────────────────────────
# Transaction dataclass
# ──────────────────────────────────────────────────────────────────────────────

@dataclass
class PayoutTransaction:
    transaction_id: str
    claim_id: str
    worker_id: str
    amount_rs: int
    upi_id: Optional[str]
    idempotency_key: str
    processed_at: str           # ISO-8601 UTC
    already_processed: bool = False


# ──────────────────────────────────────────────────────────────────────────────
# Engine
# ──────────────────────────────────────────────────────────────────────────────

class PayoutEngine:
    """
    Safe, idempotent payout executor.
    All state mutations are inside db_lock for thread safety.
    """

    @staticmethod
    def execute_payout(claim_id: str) -> PayoutTransaction:
        """
        Execute payout for a single ELIGIBLE claim.

        Steps:
            1. Load claim + validate status
            2. Build idempotency_key and check Redis/memory cache
            3. Atomically mark claim PAID, update policy.remaining_cap
            4. Record idempotency key
            5. Return PayoutTransaction

        Raises:
            ValueError — if claim not found, not eligible, or policy cap exhausted
        """
        # ── 1. Load claim ─────────────────────────────────────────────────────
        with session.db_lock:
            claim_data = session.claims.get(claim_id)

        if not claim_data:
            raise ValueError(f"Claim {claim_id} not found.")

        claim: Claim = claim_data if isinstance(claim_data, Claim) else Claim(**claim_data)

        # ── 2. Idempotency check (BEFORE status check) ────────────────────────
        week_id = PayoutEngine._get_week_id()
        idempotency_key = f"payout_{claim.worker_id}_{claim.event_id}_{week_id}"
        worker_upi: Optional[str] = PayoutEngine._get_worker_upi(claim.worker_id)

        if session.is_payout_done(idempotency_key):
            logger.info(
                "PayoutEngine: idempotency hit for key=%s claim=%s — skipping duplicate",
                idempotency_key, claim_id,
            )
            return PayoutTransaction(
                transaction_id=f"txn_dup_{uuid.uuid4().hex[:8]}",
                claim_id=claim_id,
                worker_id=claim.worker_id,
                amount_rs=claim.final_payout,
                upi_id=worker_upi,
                idempotency_key=idempotency_key,
                processed_at=claim.processed_at.isoformat() + "Z" if claim.processed_at else datetime.utcnow().isoformat() + "Z",
                already_processed=True,
            )

        # ── 3. Validate claim status ──────────────────────────────────────────
        if claim.status not in (ClaimStatus.ELIGIBLE, ClaimStatus.PAYOUT_READY):
            raise ValueError(
                f"Claim {claim_id} is not eligible for payout (status={claim.status.value})."
            )

        if claim.final_payout <= 0:
            raise ValueError(
                f"Claim {claim_id} has zero payout amount — cannot process."
            )


        # ── 3. Policy cap check + atomic state update ─────────────────────────
        transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
        processed_at = datetime.utcnow()
        worker_upi: Optional[str] = PayoutEngine._get_worker_upi(claim.worker_id)

        with session.db_lock:
            # Re-read inside lock
            claim_data_fresh = session.claims.get(claim_id)
            claim = (
                claim_data_fresh
                if isinstance(claim_data_fresh, Claim)
                else Claim(**claim_data_fresh)
            )

            # Guard: another thread may have paid by now
            if claim.status == ClaimStatus.PAID:
                logger.info(
                    "PayoutEngine: claim %s already PAID by concurrent thread", claim_id
                )
                session.mark_payout_done(idempotency_key)
                return PayoutTransaction(
                    transaction_id=transaction_id,
                    claim_id=claim_id,
                    worker_id=claim.worker_id,
                    amount_rs=claim.final_payout,
                    upi_id=worker_upi,
                    idempotency_key=idempotency_key,
                    processed_at=claim.processed_at.isoformat() + "Z" if claim.processed_at else processed_at.isoformat() + "Z",
                    already_processed=True,
                )

            # Policy cap deduction
            if claim.policy_id != "NONE":
                policy_data = session.policies.get(claim.policy_id)
                if policy_data:
                    policy: Policy = (
                        policy_data if isinstance(policy_data, Policy) else Policy(**policy_data)
                    )
                    if policy.remaining_cap < claim.final_payout:
                        raise ValueError(
                            f"Policy {claim.policy_id} cap exhausted "
                            f"(remaining={policy.remaining_cap}, needed={claim.final_payout})."
                        )
                    policy = policy.model_copy(
                        update={"remaining_cap": policy.remaining_cap - claim.final_payout}
                    )
                    session.policies[claim.policy_id] = policy

            # Update claim
            claim = claim.model_copy(
                update={
                    "status": ClaimStatus.PAID,
                    "processed_at": processed_at,
                }
            )
            session.claims[claim_id] = claim

        # ── 4. Record idempotency key (outside claim lock, still safe) ────────
        session.mark_payout_done(idempotency_key)

        logger.info(
            "PayoutEngine: PAID claim=%s worker=%s amount=₹%d txn=%s key=%s",
            claim_id, claim.worker_id, claim.final_payout, transaction_id, idempotency_key,
        )

        return PayoutTransaction(
            transaction_id=transaction_id,
            claim_id=claim_id,
            worker_id=claim.worker_id,
            amount_rs=claim.final_payout,
            upi_id=worker_upi,
            idempotency_key=idempotency_key,
            processed_at=processed_at.isoformat() + "Z",
            already_processed=False,
        )

    @staticmethod
    def execute_batch_payouts(
        claims: List[Claim],
        batch_size: int = BATCH_SIZE,
    ) -> List[PayoutTransaction]:
        """
        Batch payout executor for HIGH confidence claims.

        Args:
            claims:     List of Claim objects to process
            batch_size: Maximum claims per batch iteration (default 200)

        Returns:
            List of PayoutTransaction results (successful only)
        """
        eligible_claims = [
            c for c in claims
            if c.status in (ClaimStatus.ELIGIBLE, ClaimStatus.PAYOUT_READY)
            and c.confidence_lane == "HIGH"
            and c.final_payout > 0
        ]

        results: List[PayoutTransaction] = []
        total = len(eligible_claims)
        logger.info(
            "PayoutEngine: batch starting — %d HIGH-lane eligible claims (batch_size=%d)",
            total, batch_size,
        )

        for i in range(0, total, batch_size):
            chunk = eligible_claims[i : i + batch_size]
            for claim in chunk:
                try:
                    txn = PayoutEngine.execute_payout(claim.claim_id)
                    results.append(txn)
                except ValueError as exc:
                    logger.warning(
                        "PayoutEngine: batch skip claim=%s: %s", claim.claim_id, exc
                    )
                except Exception as exc:
                    logger.error(
                        "PayoutEngine: batch error claim=%s: %s", claim.claim_id, exc
                    )

        logger.info(
            "PayoutEngine: batch complete — %d/%d successful", len(results), total
        )
        return results

    # ── Private helpers ───────────────────────────────────────────────────────

    @staticmethod
    def _get_week_id() -> str:
        """Return YYYYWW week identifier string (e.g. 202616 for week 16 of 2026)."""
        now = datetime.utcnow()
        return now.strftime("%Y%W")

    @staticmethod
    def _get_worker_upi(worker_id: str) -> Optional[str]:
        with session.db_lock:
            wd = session.workers.get(worker_id)
        if not wd:
            return None
        from app.models.domain import Worker
        w = wd if isinstance(wd, Worker) else Worker(**wd)
        return w.upi_id
