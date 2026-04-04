from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List
from app.schemas.claim import ClaimResponse, ClaimSummary
from app.schemas.generic import GenericResponse
from app.services import auth_service as auth
from app.db import session
from app.models.domain import Claim, ClaimStatus

router = APIRouter()

def get_current_worker_id(authorization: str = Header(...)) -> str:
    token = authorization.replace("Bearer ", "")
    session_data = auth.get_session(token)
    if not session_data or not session_data.worker_id:
        raise HTTPException(status_code=401, detail="Invalid session or worker not registered")
    return session_data.worker_id

@router.get("/me", response_model=List[ClaimResponse])
async def get_my_claims(worker_id: str = Depends(get_current_worker_id)):
    """
    Get all claims for the authenticated worker.
    Used for the worker's claim history dashboard.
    """
    with session.db_lock:
        claims_list = list(session.claims.values())

    worker_claims = []
    for c in claims_list:
        obj = c if isinstance(c, Claim) else Claim(**c)
        if obj.worker_id == worker_id:
            worker_claims.append(obj)

    # Sort by creation time (newest first)
    worker_claims.sort(key=lambda x: x.created_at, reverse=True)
    return worker_claims

@router.get("/summary", response_model=ClaimSummary)
async def get_claims_summary():
    """
    Admin/System level summary of claims.
    """
    with session.db_lock:
        claims_list = list(session.claims.values())

    all_claims = [c if isinstance(c, Claim) else Claim(**c) for c in claims_list]
    total_payout = sum(c.final_payout for c in all_claims if c.status == ClaimStatus.PAID or c.status == ClaimStatus.PAYOUT_READY)
    pending_review = len([c for c in all_claims if c.status == ClaimStatus.REVIEW])
    
    return ClaimSummary(
        total_claims=len(all_claims),
        total_payout=total_payout,
        pending_review=pending_review
    )

@router.get("/{claim_id}", response_model=ClaimResponse)
async def get_claim(claim_id: str):
    claim_data = session.claims.get(claim_id)
    if not claim_data:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    obj = claim_data if isinstance(claim_data, Claim) else Claim(**claim_data)
    return obj

@router.post("/{claim_id}/approve", response_model=ClaimResponse)
async def approve_claim(claim_id: str):
    """
    Manually approve a claim in REVIEW lane or REJECTED state if correction needed.
    """
    with session.db_lock:
        claim_data = session.claims.get(claim_id)
        if not claim_data:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        claim = claim_data if isinstance(claim_data, Claim) else Claim(**claim_data)
        # Allow moving to ELIGIBLE from REJECTED or other non-PAID states for admin override
        if claim.status == ClaimStatus.PAID:
            raise HTTPException(status_code=400, detail="Cannot approve an already paid claim")
        
        claim.status = ClaimStatus.ELIGIBLE
        session.claims[claim_id] = claim
        return claim

@router.post("/{claim_id}/payout", response_model=GenericResponse)
async def execute_payout(claim_id: str):
    """
    Execute the payout for an ELIGIBLE claim.
    """
    from app.services.automation import AutomationService
    success = AutomationService.execute_payout(claim_id)
    if not success:
        raise HTTPException(status_code=400, detail="Payout execution failed: Ensure claim is ELIGIBLE and policy exists")
    
    return GenericResponse(message="Payout executed successfully", data={"claim_id": claim_id})
