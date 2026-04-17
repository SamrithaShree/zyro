from enum import Enum
from typing import List, Dict, Optional

class OnboardingState(str, Enum):
    INIT = "INIT"
    PHONE_VERIFIED = "PHONE_VERIFIED"
    PERMISSIONS_COMPLETED = "PERMISSIONS_COMPLETED"
    AADHAAR_OTP_SENT = "AADHAAR_OTP_SENT"
    AADHAAR_LINKED = "AADHAAR_LINKED"
    SELFIE_VERIFIED = "SELFIE_VERIFIED"
    LOCATION_CAPTURED = "LOCATION_CAPTURED"
    WORK_PROFILE_COMPLETED = "WORK_PROFILE_COMPLETED"
    UPI_CONFIGURED = "UPI_CONFIGURED"
    WORKER_REGISTERED = "WORKER_REGISTERED"
    MPIN_SET = "MPIN_SET"
    INSURANCE_ACKNOWLEDGED = "INSURANCE_ACKNOWLEDGED"
    READY = "READY"

# Define the strict linear progression
STATE_ORDER: List[OnboardingState] = [
    OnboardingState.INIT,
    OnboardingState.PHONE_VERIFIED,
    OnboardingState.PERMISSIONS_COMPLETED,
    OnboardingState.AADHAAR_OTP_SENT,
    OnboardingState.AADHAAR_LINKED,
    OnboardingState.SELFIE_VERIFIED,
    OnboardingState.LOCATION_CAPTURED,
    OnboardingState.WORK_PROFILE_COMPLETED,
    OnboardingState.UPI_CONFIGURED,
    OnboardingState.WORKER_REGISTERED,
    OnboardingState.MPIN_SET,
    OnboardingState.INSURANCE_ACKNOWLEDGED,
    OnboardingState.READY
]

# Map actions to their resulting states
ACTION_TO_STATE: Dict[str, OnboardingState] = {
    "verify_otp": OnboardingState.PHONE_VERIFIED,
    "grant_permissions": OnboardingState.PERMISSIONS_COMPLETED,
    "send_aadhaar_otp": OnboardingState.AADHAAR_OTP_SENT,
    "verify_aadhaar_otp": OnboardingState.AADHAAR_LINKED,
    "verify_selfie": OnboardingState.SELFIE_VERIFIED,
    "capture_location": OnboardingState.LOCATION_CAPTURED,
    "save_work_profile": OnboardingState.WORK_PROFILE_COMPLETED,
    "configure_upi": OnboardingState.UPI_CONFIGURED,
    "register_worker": OnboardingState.WORKER_REGISTERED,
    "set_mpin": OnboardingState.MPIN_SET,
    "acknowledge_insurance": OnboardingState.INSURANCE_ACKNOWLEDGED
}

def get_next_state(current_state: OnboardingState) -> Optional[OnboardingState]:
    try:
        idx = STATE_ORDER.index(current_state)
        if idx + 1 < len(STATE_ORDER):
            return STATE_ORDER[idx + 1]
    except ValueError:
        pass
    return None

def is_transition_valid(current_state: OnboardingState, action: str) -> bool:
    target_state = ACTION_TO_STATE.get(action)
    if not target_state:
        return False
    
    # Allow staying in same state (idempotency)
    if current_state == target_state:
        return True
        
    # Allow resending Aadhaar OTP while in AADHAAR_OTP_SENT
    if action == "send_aadhaar_otp" and current_state == OnboardingState.AADHAAR_OTP_SENT:
        return True

    # Get indices for comparison
    try:
        current_idx = STATE_ORDER.index(current_state)
        target_idx = STATE_ORDER.index(target_state)
        
        # Allow any forward jump in the sequence for the hackathon demo.
        # This makes it resilient to serverless instances losing intermediate state.
        return target_idx > current_idx
    except ValueError:
        return False

def validate_and_transition(session, action: str):
    from fastapi import HTTPException
    
    if not is_transition_valid(session.onboarding_state, action):
        expected_next = get_next_state(session.onboarding_state)
        raise HTTPException(
            status_code=400,
            detail={
                "status": "ERROR",
                "message": "Invalid onboarding transition",
                "data": {
                    "current_state": session.onboarding_state,
                    "attempted_action": action,
                    "expected_next_steps": [expected_next] if expected_next else []
                }
            }
        )
    
    target_state = ACTION_TO_STATE.get(action)
    if target_state:
        session.onboarding_state = target_state
