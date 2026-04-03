from fastapi import APIRouter, HTTPException, Header, Depends
from ...schemas.worker import WorkerRegister, WorkerInfo
from ...schemas.generic import GenericResponse
from ...services import insurance as ins
from ...services import auth_service as auth

router = APIRouter()

async def get_current_session(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    session = auth.get_session(token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return session

@router.post("/register", response_model=GenericResponse)
async def register(request: WorkerRegister, session = Depends(get_current_session)):
    if session.worker_id:
        raise HTTPException(status_code=400, detail="Worker already registered")
        
    worker = ins.register_worker(
        phone=session.phone,
        platform=request.platform,
        zone=request.zone,
        income_band=request.income_band
    )
    
    # Link session to new worker_id
    session.worker_id = worker.worker_id
    
    return GenericResponse(
        message="Worker registered successfully",
        data=WorkerInfo(
            worker_id=worker.worker_id,
            phone=worker.phone,
            platform=worker.platform,
            zone=worker.zone,
            income_band=worker.income_band,
            trust_score=worker.trust_score
        )
    )
