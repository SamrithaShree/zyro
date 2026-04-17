"""
api/v1/endpoints/claims.py — Claims API.

Endpoints:
    GET   /claims/me                 — Authenticated worker's claim history
    GET   /claims/summary            — Admin summary stats
    GET   /claims/{claim_id}         — Single claim detail
    POST  /claims/{claim_id}/approve — Admin: override claim to ELIGIBLE
    POST  /claims/{claim_id}/payout  — Execute payout (returns transaction)
    POST  /claims/create             — Admin: manually trigger WIVE + ClaimGenerator
"""

import logging

from fastapi import APIRouter, Depends, Header, HTTPException

from app.db import session
from app.models.domain import Claim, ClaimStatus, Event, Worker
from app.schemas.claim import (
    ClaimCreateRequest,
    ClaimResponse,
    ClaimSummary,
    PayoutResponse,
)
from app.schemas.generic import GenericResponse, GlobalResponse, error, success
from app.services import auth_service as auth
from app.services.claim_generator import ClaimGenerator
from app.services.payout_engine import PayoutEngine

router = APIRouter()
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# Auth dependency
# ──────────────────────────────────────────────────────────────────────────────

def get_current_worker_id(authorization: str = Header(...)) -> str:
    token = authorization.replace("Bearer ", "")
    session_data = auth.get_session(token)
    if not session_data or not session_data.worker_id:
        raise HTTPException(
            status_code=401, detail="Invalid or expired session."
        )
    return session_data.worker_id


# ──────────────────────────────────────────────────────────────────────────────
# GET /claims/me
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=GlobalResponse)
async def get_my_claims(
    worker_id: str = Depends(get_current_worker_id),
) -> GlobalResponse:
    """
    Return the authenticated worker's full claim history.

    Response data items include:
        payout_amount, protection_ratio, explanation, confidence_lane, status
    """
    with session.db_lock:
        all_claims = list(session.claims.values())

    worker_claims = []
    for cd in all_claims:
        c = cd if isinstance(cd, Claim) else Claim(**cd)
        if c.worker_id == worker_id:
            worker_claims.append(c)

    worker_claims.sort(key=lambda x: x.created_at, reverse=True)

    claim_items = []
    for c in worker_claims:
        claim_items.append(
            {
                "claim_id": c.claim_id,
                "event_id": c.event_id,
                "policy_id": c.policy_id,
                "status": c.status.value,
                "payout_amount": c.final_payout,
                "estimated_loss": c.estimated_loss,
                "protection_ratio": c.protection_ratio,
                "uncovered_loss": c.uncovered_loss,
                "explanation": c.explanation,
                "why_eligible": c.why_eligible,
                "rejection_reason": c.rejection_reason,
                "confidence_lane": c.confidence_lane,
                "confidence_score": c.confidence_score,
                "validation_breakdown": c.validation_breakdown.model_dump(),
                "impact_reasoning": c.impact_reasoning.model_dump(),
                "created_at": c.created_at.isoformat() + "Z",
                "processed_at": c.processed_at.isoformat() + "Z" if c.processed_at else None,
            }
        )

    return success(
        message=f"Found {len(claim_items)} claim(s) for worker.",
        data=claim_items,
    )


# ──────────────────────────────────────────────────────────────────────────────
# GET /claims/summary
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/summary", response_model=ClaimSummary)
async def get_claims_summary() -> ClaimSummary:
    """Admin/system-level claims summary (used by dashboard)."""
    with session.db_lock:
        all_claims = list(session.claims.values())

    claims = [cd if isinstance(cd, Claim) else Claim(**cd) for cd in all_claims]
    paid_statuses = {ClaimStatus.PAID, ClaimStatus.PAYOUT_READY}
    total_payout = sum(c.final_payout for c in claims if c.status in paid_statuses)
    pending_review = len([c for c in claims if c.status == ClaimStatus.REVIEW])

    return ClaimSummary(
        total_claims=len(claims),
        total_payout=total_payout,
        pending_review=pending_review,
    )


# ──────────────────────────────────────────────────────────────────────────────
# POST /claims/create  (admin / internal)
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/create", response_model=GlobalResponse)
async def create_claim_manual(body: ClaimCreateRequest) -> GlobalResponse:
    """
    Admin endpoint: manually trigger WIVE + ClaimGenerator for a specific
    worker + event pair — bypassing the background pipeline.

    Idempotent: if the claim already exists it is returned unchanged.
    """
    # Load event
    with session.db_lock:
        event_data = session.events.get(body.event_id)
    if not event_data:
        raise HTTPException(status_code=404, detail=f"Event {body.event_id} not found.")

    event = event_data if isinstance(event_data, Event) else Event(**event_data)

    # Load worker
    with session.db_lock:
        worker_data = session.workers.get(body.worker_id)
    if not worker_data:
        raise HTTPException(status_code=404, detail=f"Worker {body.worker_id} not found.")

    worker = worker_data if isinstance(worker_data, Worker) else Worker(**worker_data)

    try:
        claim = ClaimGenerator.create_and_route_claim(event=event, worker=worker)
    except Exception as exc:
        logger.error("create_claim_manual error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))

    return success(
        message=f"Claim {claim.claim_id} processed via manual trigger.",
        data={
            "claim_id": claim.claim_id,
            "worker_id": claim.worker_id,
            "event_id": claim.event_id,
            "status": claim.status.value,
            "payout_amount": claim.final_payout,
            "confidence_lane": claim.confidence_lane,
            "confidence_score": claim.confidence_score,
        },
    )


# ──────────────────────────────────────────────────────────────────────────────
# GET /claims/{claim_id}
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/{claim_id}", response_model=GlobalResponse)
async def get_claim(claim_id: str) -> GlobalResponse:
    with session.db_lock:
        claim_data = session.claims.get(claim_id)

    if not claim_data:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found.")

    c = claim_data if isinstance(claim_data, Claim) else Claim(**claim_data)
    return success(
        message="Claim retrieved.",
        data={
            "claim_id": c.claim_id,
            "event_id": c.event_id,
            "worker_id": c.worker_id,
            "policy_id": c.policy_id,
            "status": c.status.value,
            "payout_amount": c.final_payout,
            "estimated_loss": c.estimated_loss,
            "protection_ratio": c.protection_ratio,
            "uncovered_loss": c.uncovered_loss,
            "explanation": c.explanation,
            "why_eligible": c.why_eligible,
            "rejection_reason": c.rejection_reason,
            "confidence_lane": c.confidence_lane,
            "confidence_score": c.confidence_score,
            "validation_breakdown": c.validation_breakdown.model_dump(),
            "impact_reasoning": c.impact_reasoning.model_dump(),
            "severity_factor": c.severity_factor,
            "trust_multiplier": c.trust_multiplier_used,
            "risk_score": c.risk_score_snapshot,
            "created_at": c.created_at.isoformat() + "Z",
            "processed_at": c.processed_at.isoformat() + "Z" if c.processed_at else None,
        },
    )


# ──────────────────────────────────────────────────────────────────────────────
# POST /claims/{claim_id}/approve  (admin override)
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/{claim_id}/approve", response_model=GlobalResponse)
async def approve_claim(claim_id: str) -> GlobalResponse:
    """Admin: manually move a claim to ELIGIBLE for manual payout."""
    with session.db_lock:
        claim_data = session.claims.get(claim_id)
        if not claim_data:
            raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found.")

        c = claim_data if isinstance(claim_data, Claim) else Claim(**claim_data)
        if c.status == ClaimStatus.PAID:
            raise HTTPException(status_code=400, detail="Cannot approve an already paid claim.")

        c = c.model_copy(update={"status": ClaimStatus.ELIGIBLE})
        session.claims[claim_id] = c

    return success(
        message=f"Claim {claim_id} approved. Status set to ELIGIBLE.",
        data={"claim_id": claim_id, "status": "ELIGIBLE"},
    )


# ──────────────────────────────────────────────────────────────────────────────
# POST /claims/{claim_id}/payout
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/{claim_id}/payout", response_model=GlobalResponse)
async def execute_payout(claim_id: str) -> GlobalResponse:
    """
    Execute payout for an ELIGIBLE claim via PayoutEngine.

    Returns full transaction details including idempotency_key.
    Calling this endpoint a second time with the same claim_id is safe —
    the idempotency key prevents double-payment and returns already_processed=true.
    """
    try:
        txn = PayoutEngine.execute_payout(claim_id)
    except ValueError as exc:
        logger.warning("execute_payout failed claim=%s: %s", claim_id, exc)
        return error(message=str(exc), data={"claim_id": claim_id})
    except Exception as exc:
        logger.error("execute_payout unexpected error claim=%s: %s", claim_id, exc)
        raise HTTPException(status_code=500, detail="Internal error during payout.")

    payout_data = PayoutResponse(
        transaction_id=txn.transaction_id,
        claim_id=txn.claim_id,
        amount_rs=txn.amount_rs,
        upi_id=txn.upi_id,
        idempotency_key=txn.idempotency_key,
        processed_at=txn.processed_at,
        already_processed=txn.already_processed,
    )

    if txn.already_processed:
        return success(
            message="Payout already processed (idempotent response).",
            data=payout_data.model_dump(),
        )

    return success(
        message=f"Payout of ₹{txn.amount_rs} executed successfully.",
        data=payout_data.model_dump(),
    )
