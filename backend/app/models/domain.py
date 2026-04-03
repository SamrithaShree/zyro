from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime
import uuid

class Worker(BaseModel):
    worker_id: str
    phone: str
    platform: Optional[str] = None
    zone: Optional[str] = None
    income_band: Optional[str] = None
    trust_score: float = 85.0
    hashed_mpin: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Policy(BaseModel):
    policy_id: str
    worker_id: str
    premium_amount: int
    hourly_benefit: int
    weekly_cap: int
    status: str = "ACTIVE"  # ACTIVE, EXPIRED
    valid_until: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Session(BaseModel):
    token: str
    phone: str
    worker_id: Optional[str] = None
    expires_at: datetime
    is_otp_verified: bool = False
    is_mpin_verified: bool = False
