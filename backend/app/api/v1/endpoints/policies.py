from fastapi import APIRouter, HTTPException, Depends
from ...schemas.policy import PolicyQuoteRequest, PolicyQuote, PolicyActivationResponse
from ...schemas.generic import GenericResponse
from ...services import insurance as ins
from .workers import get_current_session

router = APIRouter()

@router.post("/quote", response_model=GenericResponse)
async def quote(request: PolicyQuoteRequest, session = Depends(get_current_session)):
    # Calculate quote based on the deterministic pricing logic
    quote_data = ins.get_policy_quote(request.zone, request.income_band)
    
    return GenericResponse(
        message="Quote generated successfully",
        data=PolicyQuote(**quote_data)
    )

@router.post("/activate", response_model=GenericResponse)
async def activate(session = Depends(get_current_session)):
    if not session.worker_id:
        raise HTTPException(status_code=400, detail="Worker must be registered to activate a policy")
        
    worker = ins.get_worker_by_id(session.worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker profile not found")
        
    # In a real app, this would be gated by a payment success signal.
    # For Phase 2, we simulate activation.
    policy = ins.activate_policy(
        worker_id=worker.worker_id,
        zone=worker.zone,
        income_band=worker.income_band
    )
    
    return GenericResponse(
        message="Policy activated successfully",
        data=PolicyActivationResponse(
            policy_id=policy.policy_id,
            status=policy.status,
            valid_until=policy.valid_until
        )
    )
