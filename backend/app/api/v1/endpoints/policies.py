from fastapi import APIRouter, HTTPException, Depends
from app.schemas.policy import (
    PolicyQuoteRequest, 
    PolicyRecommendationResponse, 
    PolicyActivationRequest, 
    PolicyActivationResponse, 
    AcknowledgementRequest,
    DashboardPolicyStatus,
    PlanOption
)
from app.schemas.generic import GenericResponse
from app.services import insurance as ins
from app.core.onboarding import validate_and_transition, OnboardingState
from .workers import get_current_session
from app.db import session as db

router = APIRouter()

@router.post("/quote", response_model=GenericResponse)
async def quote(session = Depends(get_current_session)):
    # In Phase 2, we quote based on the worker's registered profile
    if not session.worker_id:
        # Fallback for pre-registration quote if needed, but primary path is post-onboarding
        raise HTTPException(status_code=400, detail="Worker must be registered to get a personalized quote")
        
    worker = ins.get_worker_by_id(session.worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker profile not found")
        
    recommendations = ins.get_policy_recommendations(worker)
    
    return GenericResponse(
        message="Personalized plans generated based on your earning intent",
        data=PolicyRecommendationResponse(**recommendations)
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
async def activate(request: PolicyActivationRequest, session = Depends(get_current_session)):
    if not session.worker_id:
        raise HTTPException(status_code=400, detail="Worker not registered")
    
    if session.onboarding_state != OnboardingState.READY:
        raise HTTPException(status_code=400, detail="Onboarding not complete or insurance not acknowledged")
        
    # Idempotency check: look for existing active policy for this worker
    existing_policy = ins.get_active_policy(session.worker_id)
    if existing_policy:
        return GenericResponse(
            message="Active policy already exists",
            data=PolicyActivationResponse(
                policy_id=existing_policy.policy_id,
                status=existing_policy.status,
                valid_until=existing_policy.valid_until.isoformat(),
                tier=existing_policy.tier,
                premium_amount=existing_policy.premium_amount,
                hourly_benefit=existing_policy.hourly_benefit,
                weekly_cap=existing_policy.weekly_cap
            )
        )

    worker = ins.get_worker_by_id(session.worker_id)
    policy = ins.activate_policy(worker, request.tier)
    
    return GenericResponse(
        message=f"{policy.tier} Protection Activated Successfully",
        data=PolicyActivationResponse(
            policy_id=policy.policy_id,
            status=policy.status,
            valid_until=policy.valid_until.isoformat(),
            tier=policy.tier,
            premium_amount=policy.premium_amount,
            hourly_benefit=policy.hourly_benefit,
            weekly_cap=policy.weekly_cap
        )
    )

@router.get("/status", response_model=GenericResponse)
async def get_policy_status(session = Depends(get_current_session)):
    if not session.worker_id:
        return GenericResponse(message="No worker profile", data=DashboardPolicyStatus(has_active_policy=False))
        
    policy = ins.get_active_policy(session.worker_id)
    if not policy:
        return GenericResponse(message="No active policy", data=DashboardPolicyStatus(has_active_policy=False))
        
    status = DashboardPolicyStatus(
        has_active_policy=True,
        policy_details=PlanOption(
            tier=policy.tier,
            premium_amount=policy.premium_amount,
            hourly_benefit=policy.hourly_benefit,
            weekly_cap=policy.weekly_cap,
            covered_triggers=policy.covered_triggers,
            replacement_fraction=policy.replacement_fraction,
            expected_weekly_loss=policy.expected_weekly_loss,
            intended_protection_level=f"{int(policy.replacement_fraction * 100)}%",
            pricing_drivers=[], # Snapshot not stored yet
            explanation=policy.recommendation_explanation
        ),
        remaining_cap=policy.remaining_cap,
        coverage_window=f"{policy.valid_from.strftime('%b %d')} - {policy.valid_until.strftime('%b %d')}"
    )
    
    return GenericResponse(message="Active policy status retrieved", data=status)
