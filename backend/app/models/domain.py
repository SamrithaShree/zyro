from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime
import uuid

class Worker(BaseModel):
    worker_id: str
    phone: str
    platform: Optional[str] = None
    zone: Optional[str] = None
    city: Optional[str] = "Chennai"
    income_band: Optional[str] = None
    working_hours_per_day: int = 8
    days_worked_per_week: int = 6
    upi_id: Optional[str] = None
    masked_aadhaar: Optional[str] = None
    trust_score: float = 85.0
    worker_badge: str = "ZYRO_VERIFIED"
    hashed_mpin: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Policy(BaseModel):
    policy_id: str
    worker_id: str
    tier: str # Basic, Standard, Premium
    premium_amount: int
    hourly_benefit: int
    weekly_cap: int
    remaining_cap: int
    replacement_fraction: float
    expected_weekly_loss: int
    covered_triggers: List[str]
    recommendation_explanation: str
    
    # Contract Snapshots (Immutable for the week)
    income_estimate_snapshot: int
    working_hours_snapshot: int
    
    status: str = "ACTIVE"  # ACTIVE, EXPIRED
    valid_from: datetime = Field(default_factory=datetime.utcnow)
    valid_until: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

from app.core.onboarding import OnboardingState

class Session(BaseModel):
    token: str
    phone: str
    worker_id: Optional[str] = None
    expires_at: datetime
    
    # Onboarding State Machine
    onboarding_state: OnboardingState = OnboardingState.INIT
    
    # Onboarding Flags (Retained for granular metadata)
    phone_verified: bool = True
    permissions_granted: bool = False
    aadhaar_otp_sent: bool = False
    aadhaar_linked: bool = False
    selfie_verified: bool = False
    location_verified: bool = False
    work_profile_completed: bool = False
    upi_configured: bool = False
    insurance_acknowledged: bool = False
    worker_created: bool = False
    mpin_set: bool = False

    # Temporary Onboarding Data
    temp_platform: Optional[str] = None
    temp_zone: Optional[str] = None
    temp_income_band: Optional[str] = None
    temp_working_hours_per_day: int = 8
    temp_days_worked_per_week: int = 6
    temp_masked_aadhaar: Optional[str] = None
    temp_upi_id: Optional[str] = None
    temp_location: Optional[dict] = None
