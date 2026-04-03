from fastapi import APIRouter, HTTPException, Depends
from app.schemas.policy import PolicyQuoteRequest, PolicyQuote, PolicyActivationResponse, AcknowledgementRequest
from app.schemas.generic import GenericResponse
from app.services import insurance as ins
from app.core.onboarding import validate_and_transition, OnboardingState
from .workers import get_current_session
from app.db import session as db

router = APIRouter()

@router.post("/quote", response_model=GenericResponse)
async def quote(request: PolicyQuoteRequest, session = Depends(get_current_session)):
    quote_data = ins.get_policy_quote(request.zone, request.income_band)
    return GenericResponse(
        message="Quote generated successfully",
        data=PolicyQuote(**quote_data)
    )

@router.post("/acknowledge", response_model=GenericResponse)
async def acknowledge(request: AcknowledgementRequest, session = Depends(get_current_session)):
    if not request.terms_accepted or not request.privacy_accepted:
        raise HTTPException(status_code=400, detail="Terms and Privacy must be accepted")
        
    validate_and_transition(session, "acknowledge_insurance")
    # State machine moves to INSURANCE_ACKNOWLEDGED, but we also want to mark READY
    session.onboarding_state = OnboardingState.READY
    
    session.insurance_acknowledged = True
    return GenericResponse(message="Insurance terms acknowledged")

@router.post("/activate", response_model=GenericResponse)
async def activate(session = Depends(get_current_session)):
    if not session.worker_id:
        raise HTTPException(status_code=400, detail="Worker not registered")
    
    if session.onboarding_state != OnboardingState.READY:
        raise HTTPException(status_code=400, detail="Onboarding not complete or insurance not acknowledged")
        
    # Idempotency check: look for existing active policy for this worker
    with db.db_lock:
        existing_policy = next((p for p in db.policies.values() if p.worker_id == session.worker_id and p.status == "ACTIVE"), None)
        if existing_policy:
            return GenericResponse(
                message="Active policy already exists",
                data=PolicyActivationResponse(
                    policy_id=existing_policy.policy_id,
                    status=existing_policy.status,
                    valid_until=existing_policy.valid_until.isoformat()
                )
            )

    worker = ins.get_worker_by_id(session.worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker profile not found")
        
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
            valid_until=policy.valid_until.isoformat()
        )
    )
