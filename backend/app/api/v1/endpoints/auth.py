from fastapi import APIRouter, HTTPException, Header, Depends
from app.schemas.auth import OTPRequest, OTPVerify, MPinSetup, MPinLogin, AuthResponse
from app.schemas.generic import GenericResponse
from app.services import auth_service as auth
from app.db import session as db

router = APIRouter()

@router.post("/send-otp", response_model=GenericResponse)
async def send_otp(request: OTPRequest):
    # In a real app, this would trigger an SMS. 
    # For the hackathon, we simply acknowledge the request.
    return GenericResponse(
        message="OTP sent successfully",
        data={"otp": "123456"} # Included in data for demo visibility
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
    
    return GenericResponse(
        message="OTP verified successfully",
        data=AuthResponse(
            token=token,
            is_registered=worker_id is not None,
            has_mpin=has_mpin,
            worker_id=worker_id
        )
    )

@router.post("/set-mpin", response_model=GenericResponse)
async def set_mpin(request: MPinSetup, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    session = auth.get_session(token)
    
    if not session or not session.worker_id:
        raise HTTPException(status_code=401, detail="Unauthorized or worker not registered")
    
    auth.set_worker_mpin(session.worker_id, request.mpin)
    
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
