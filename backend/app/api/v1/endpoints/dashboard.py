"""
api/v1/endpoints/dashboard.py — Admin Dashboard Metrics.

Endpoints:
    GET /dashboard/admin — Real-time reserve pool, claims distribution, fraud alerts

Computes from in-memory state (no external DB needed for hackathon).
"""

import logging
from datetime import datetime

from fastapi import APIRouter

from app.db import session
from app.models.domain import Claim, ClaimStatus, Policy
from app.schemas.generic import GlobalResponse, success

router = APIRouter()
logger = logging.getLogger(__name__)

# Stop-loss threshold ratio (spec: 140% of weekly premium collected)
STOP_LOSS_RATIO: float = 1.40
# Fraud alert threshold: anomaly_score ≥ 0.70 (confidence_score ≤ 0.30)
FRAUD_ALERT_LANE = "REVIEW"


@router.get("/admin", response_model=GlobalResponse)
async def get_admin_dashboard() -> GlobalResponse:
    """
    Real-time admin dashboard metrics.

    Returns:
        - reserve_pool:               Weekly premium collected, payout, stop-loss
        - claims_summary:             Totals, payout%, pending count
        - confidence_tier_distribution: HIGH / MEDIUM / REVIEW breakdown
        - fraud_alerts:               REVIEW-lane claims count + claim IDs
        - active_events_count:        Currently active disruption events
    """
    with session.db_lock:
        all_claims_raw = list(session.claims.values())
        all_policies_raw = list(session.policies.values())
        all_events_raw = list(session.events.values())

    # ── Deserialize ───────────────────────────────────────────────────────────
    all_claims: list[Claim] = [
        c if isinstance(c, Claim) else Claim(**c) for c in all_claims_raw
    ]
    all_policies: list[Policy] = [
        p if isinstance(p, Policy) else Policy(**p) for p in all_policies_raw
    ]

    # ── Reserve Pool Calculation ──────────────────────────────────────────────
    paid_statuses = {ClaimStatus.PAID, ClaimStatus.PAYOUT_READY}

    weekly_collected_premium = sum(p.premium_amount for p in all_policies)
    weekly_payout = sum(
        c.final_payout for c in all_claims if c.status in paid_statuses
    )
    stop_loss_threshold = int(weekly_collected_premium * STOP_LOSS_RATIO)
    reserve_utilization_pct = (
        round((weekly_payout / weekly_collected_premium) * 100, 2)
        if weekly_collected_premium > 0
        else 0.0
    )
    stop_loss_triggered = weekly_payout > stop_loss_threshold

    reserve_pool = {
        "weekly_collected_premium": weekly_collected_premium,
        "weekly_payout": weekly_payout,
        "stop_loss_threshold": stop_loss_threshold,
        "reserve_utilization_percent": reserve_utilization_pct,
        "stop_loss_triggered": stop_loss_triggered,
    }

    # ── Claims Summary ────────────────────────────────────────────────────────
    total_claims = len(all_claims)
    eligible_claims = [c for c in all_claims if c.status == ClaimStatus.ELIGIBLE]
    rejected_claims = [c for c in all_claims if c.status == ClaimStatus.REJECTED]
    paid_claims = [c for c in all_claims if c.status in paid_statuses]
    review_claims = [c for c in all_claims if c.confidence_lane == FRAUD_ALERT_LANE]

    payout_as_pct_of_premium = (
        round((weekly_payout / weekly_collected_premium) * 100, 2)
        if weekly_collected_premium > 0
        else 0.0
    )

    claims_summary = {
        "total_claims_created": total_claims,
        "eligible": len(eligible_claims),
        "paid": len(paid_claims),
        "rejected": len(rejected_claims),
        "pending_review": len(review_claims),
        "total_payout": weekly_payout,
        "payout_as_percent_of_premium": payout_as_pct_of_premium,
    }

    # ── Confidence Tier Distribution ──────────────────────────────────────────
    lane_counts: dict[str, dict] = {
        "HIGH": {"count": 0, "total_payout": 0},
        "MEDIUM": {"count": 0, "total_payout": 0},
        "REVIEW": {"count": 0, "total_payout": 0},
    }
    for c in all_claims:
        lane = c.confidence_lane if c.confidence_lane in lane_counts else "REVIEW"
        lane_counts[lane]["count"] += 1
        lane_counts[lane]["total_payout"] += c.final_payout

    confidence_tier_distribution = lane_counts

    # ── Fraud Alerts ──────────────────────────────────────────────────────────
    fraud_alert_claims = [
        {
            "claim_id": c.claim_id,
            "worker_id": c.worker_id,
            "event_id": c.event_id,
            "confidence_score": c.confidence_score,
            "status": c.status.value,
            "payout_amount": c.final_payout,
        }
        for c in all_claims
        if c.confidence_lane == FRAUD_ALERT_LANE
    ]

    fraud_alerts = {
        "total_flagged": len(fraud_alert_claims),
        "claims": fraud_alert_claims,
    }

    # ── Active Events ─────────────────────────────────────────────────────────
    from app.models.domain import Event, EventStatus
    active_events = [
        e if isinstance(e, Event) else Event(**e) for e in all_events_raw
    ]
    active_event_count = sum(
        1 for e in active_events if e.status == EventStatus.ACTIVE
    )

    # ── Active Workers / Policies ─────────────────────────────────────────────
    now = datetime.utcnow()
    active_policy_count = sum(
        1 for p in all_policies
        if p.status == "ACTIVE" and p.valid_from <= now <= p.valid_until
    )
    total_worker_count = len(session.workers)

    logger.debug(
        "Dashboard: claims=%d payout=₹%d premium=₹%d stop_loss=%s",
        total_claims, weekly_payout, weekly_collected_premium, stop_loss_triggered,
    )

    return success(
        message="Admin dashboard metrics retrieved.",
        data={
            "reserve_pool": reserve_pool,
            "claims_summary": claims_summary,
            "confidence_tier_distribution": confidence_tier_distribution,
            "fraud_alerts": fraud_alerts,
            "active_events_count": active_event_count,
            "active_policy_count": active_policy_count,
            "total_worker_count": total_worker_count,
            "generated_at": datetime.utcnow().isoformat() + "Z",
        },
    )
