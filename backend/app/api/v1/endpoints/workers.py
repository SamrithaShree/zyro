from fastapi import APIRouter, HTTPException, Header, Depends
from app.schemas.worker import LocationRequest, WorkProfileRequest, UPIRequest, WorkerRegister, WorkerInfo
from app.schemas.generic import GenericResponse
from app.services import insurance as ins
from app.services import auth_service as auth
from app.core.onboarding import validate_and_transition
from typing import List

router = APIRouter()

async def get_current_session(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    session = auth.get_session(token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return session

@router.post("/location", response_model=GenericResponse)
async def capture_location(request: LocationRequest, session = Depends(get_current_session)):
    validate_and_transition(session, "capture_location")
    # Normalization logic
    city = request.city or "Chennai"
    zone = request.zone or "Anna Nagar" # Default fallback
    
    session.temp_location = {"city": city, "zone": zone}
    session.location_verified = True
    return GenericResponse(message="Location captured successfully")

@router.post("/work-profile", response_model=GenericResponse)
async def work_profile(request: WorkProfileRequest, session = Depends(get_current_session)):
    validate_and_transition(session, "save_work_profile")
    # Validate income band against pricing logic
    from app.core.pricing_logic import INCOME_BAND_TO_HOURLY_BENEFIT
    if request.income_band not in INCOME_BAND_TO_HOURLY_BENEFIT:
        raise HTTPException(status_code=400, detail="Invalid income band")
    
    session.temp_platform = request.platform
    session.temp_income_band = request.income_band
    session.work_profile_completed = True
    return GenericResponse(message="Work profile saved")

@router.post("/upi", response_model=GenericResponse)
async def set_upi(request: UPIRequest, session = Depends(get_current_session)):
    validate_and_transition(session, "configure_upi")
    session.temp_upi_id = request.upi_id
    session.upi_configured = True
    return GenericResponse(message="UPI configured successfully")

@router.post("/register", response_model=GenericResponse)
async def register(request: WorkerRegister, session = Depends(get_current_session)):
    # Idempotency check: if already registered, return existing
    if session.worker_id:
        worker = ins.get_worker_by_id(session.worker_id)
        if worker:
            return GenericResponse(
                message="Existing worker profile returned",
                data=WorkerInfo(
                    worker_id=worker.worker_id,
                    phone=worker.phone,
                    platform=worker.platform,
                    zone=worker.zone,
                    city=worker.city,
                    income_band=worker.income_band,
                    upi_id=worker.upi_id,
                    masked_aadhaar=worker.masked_aadhaar,
                    trust_score=worker.trust_score,
                    worker_badge=worker.worker_badge
                )
            )

    validate_and_transition(session, "register_worker")
        
    worker = ins.register_worker(
        phone=session.phone,
        platform=session.temp_platform,
        zone=session.temp_location["zone"],
        city=session.temp_location["city"],
        income_band=session.temp_income_band,
        upi_id=session.temp_upi_id,
        masked_aadhaar=session.temp_masked_aadhaar
    )
    
    session.worker_id = worker.worker_id
    session.worker_created = True
    
    return GenericResponse(
        message="Worker registered successfully",
        data=WorkerInfo(
            worker_id=worker.worker_id,
            phone=worker.phone,
            platform=worker.platform,
            zone=worker.zone,
            city=worker.city,
            income_band=worker.income_band,
            upi_id=worker.upi_id,
            masked_aadhaar=worker.masked_aadhaar,
            trust_score=worker.trust_score,
            worker_badge=worker.worker_badge
        )
    )
