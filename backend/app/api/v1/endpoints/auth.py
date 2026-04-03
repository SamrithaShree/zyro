from fastapi import APIRouter, HTTPException, Header, Depends
from app.schemas.auth import (
    OTPRequest, OTPVerify, MPinSetup, MPinLogin, AuthResponse,
    PermissionRequest, AadhaarOTPRequest, AadhaarOTPVerify, SelfieRequest,
    OnboardingStatusResponse
)
from app.schemas.generic import GenericResponse
from app.services import auth_service as auth
from app.db import session as db
from app.core.onboarding import validate_and_transition, OnboardingState, STATE_ORDER

router = APIRouter()

@router.post("/send-otp", response_model=GenericResponse)
async def send_otp(request: OTPRequest):
    # Check if user already exists
    with db.db_lock:
        worker_id = db.phone_to_worker_id.get(request.phone)
        has_mpin = False
        if worker_id:
            worker = db.workers.get(worker_id)
            has_mpin = worker.hashed_mpin is not None

    return GenericResponse(
        message="OTP sent successfully",
        data={
            "otp": "123456",
            "is_registered": worker_id is not None,
            "has_mpin": has_mpin
        }
    )

@router.post("/verify-otp", response_model=GenericResponse)
async def verify_otp(request: OTPVerify):
    if not auth.verify_otp(request.phone, request.otp):
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    with db.db_lock:
        worker_id = db.phone_to_worker_id.get(request.phone)
        has_mpin = False
        if worker_id:
            worker = db.workers.get(worker_id)
            has_mpin = worker.hashed_mpin is not None
            
    token = auth.create_session(request.phone, worker_id)
    session = auth.get_session(token)
    
    # Transition: INIT -> PHONE_VERIFIED
    validate_and_transition(session, "verify_otp")
    
    # If returning worker, skip forward
    if worker_id:
        session.onboarding_state = OnboardingState.WORKER_REGISTERED
        if has_mpin:
            session.onboarding_state = OnboardingState.MPIN_SET
    
    return GenericResponse(
        message="OTP verified successfully",
        data=AuthResponse(
            token=token,
            is_registered=worker_id is not None,
            has_mpin=has_mpin,
            worker_id=worker_id
        )
    )

@router.get("/onboarding-status", response_model=GenericResponse)
async def onboarding_status(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    session = auth.get_session(token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Find missing steps
    try:
        current_idx = STATE_ORDER.index(session.onboarding_state)
        missing_steps = [s.value for s in STATE_ORDER[current_idx+1:]]
    except ValueError:
        missing_steps = []

    completed_flags = {
        "phone_verified": session.phone_verified,
        "permissions_granted": session.permissions_granted,
        "aadhaar_linked": session.aadhaar_linked,
        "selfie_verified": session.selfie_verified,
        "location_verified": session.location_verified,
        "work_profile_completed": session.work_profile_completed,
        "upi_configured": session.upi_configured,
        "worker_created": session.worker_created,
        "mpin_set": session.mpin_set,
        "insurance_acknowledged": session.insurance_acknowledged
    }

    return GenericResponse(
        message="Onboarding status retrieved",
        data=OnboardingStatusResponse(
            onboarding_state=session.onboarding_state.value,
            completed_flags=completed_flags,
            missing_steps=missing_steps,
            worker_exists=session.worker_id is not None,
            has_mpin=session.mpin_set,
            can_activate_policy=session.onboarding_state == OnboardingState.READY
        )
    )

@router.post("/permissions", response_model=GenericResponse)
async def permissions(request: PermissionRequest, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    session = auth.get_session(token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    validate_and_transition(session, "grant_permissions")
    session.permissions_granted = True
    return GenericResponse(message="Permissions granted")

@router.post("/send-aadhaar-otp", response_model=GenericResponse)
async def send_aadhaar_otp(request: AadhaarOTPRequest, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    session = auth.get_session(token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    validate_and_transition(session, "send_aadhaar_otp")
    
    # Mask Aadhaar
    masked = f"XXXX-XXXX-{request.aadhaar_number[-4:]}"
    session.temp_masked_aadhaar = masked
    session.aadhaar_otp_sent = True
    
    return GenericResponse(
        message="Aadhaar OTP sent successfully",
        data={"otp": "123456"}
    )

@router.post("/verify-aadhaar-otp", response_model=GenericResponse)
async def verify_aadhaar_otp(request: AadhaarOTPVerify, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    session = auth.get_session(token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    if request.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid Aadhaar OTP")
    
    validate_and_transition(session, "verify_aadhaar_otp")
    session.aadhaar_linked = True
    return GenericResponse(message="Aadhaar linked successfully")

@router.post("/verify-selfie", response_model=GenericResponse)
async def verify_selfie(request: SelfieRequest, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    session = auth.get_session(token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    validate_and_transition(session, "verify_selfie")
    session.selfie_verified = True
    return GenericResponse(
        message="Selfie verified successfully",
        data={"confidence_score": 0.98}
    )

@router.post("/set-mpin", response_model=GenericResponse)
async def set_mpin(request: MPinSetup, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    session = auth.get_session(token)
    if not session or not session.worker_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    validate_and_transition(session, "set_mpin")
    auth.set_worker_mpin(session.worker_id, request.mpin)
    session.mpin_set = True
    return GenericResponse(message="mPIN set successfully")

@router.post("/login-mpin", response_model=GenericResponse)
async def login_mpin(request: MPinLogin):
    token = auth.login_with_mpin(request.phone, request.mpin)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid phone or mPIN")
        
    with db.db_lock:
        worker_id = db.phone_to_worker_id.get(request.phone)
        
    return GenericResponse(
        message="Login successful",
        data=AuthResponse(
            token=token,
            is_registered=True,
            has_mpin=True,
            worker_id=worker_id
        )
    )

@router.post("/logout", response_model=GenericResponse)
async def logout(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    with db.db_lock:
        if token in db.sessions:
            del db.sessions[token]
    return GenericResponse(message="Logged out successfully")
