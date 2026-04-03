import hashlib
import uuid
from datetime import datetime, timedelta
from typing import Optional, Tuple
from ..db import session as db
from ..models.domain import Session, Worker

def hash_mpin(mpin: str) -> str:
    """Simple hackathon-safe hashing."""
    return hashlib.sha256(mpin.encode()).hexdigest()

def create_session(phone: str, worker_id: Optional[str] = None) -> str:
    token = f"zyro_session_{uuid.uuid4().hex}"
    expires_at = datetime.utcnow() + timedelta(days=7)
    
    with db.db_lock:
        session_data = Session(
            token=token,
            phone=phone,
            worker_id=worker_id,
            expires_at=expires_at,
            is_otp_verified=True
        )
        db.sessions[token] = session_data
        
    return token

def get_session(token: str) -> Optional[Session]:
    with db.db_lock:
        session = db.sessions.get(token)
        if session and session.expires_at > datetime.utcnow():
            return session
    return None

def verify_otp(phone: str, otp: str) -> bool:
    # Locked decision: Mock OTP is always 123456
    return otp == "123456"

def login_with_mpin(phone: str, mpin: str) -> Optional[str]:
    with db.db_lock:
        worker_id = db.phone_to_worker_id.get(phone)
        if not worker_id:
            return None
        
        worker = db.workers.get(worker_id)
        if not worker or not worker.hashed_mpin:
            return None
        
        if worker.hashed_mpin == hash_mpin(mpin):
            return create_session(phone, worker_id)
            
    return None

def set_worker_mpin(worker_id: str, mpin: str) -> bool:
    with db.db_lock:
        worker = db.workers.get(worker_id)
        if worker:
            worker.hashed_mpin = hash_mpin(mpin)
            return True
    return False
