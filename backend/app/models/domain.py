from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum
import uuid

class EventStatus(str, Enum):
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"
    EXPIRED = "EXPIRED"

class ClaimStatus(str, Enum):
    ELIGIBLE = "ELIGIBLE"
    PROCESSING = "PROCESSING"
    PAID = "PAID"
    REJECTED = "REJECTED"
    # Internal states mapped for clean output
    DETECTED = "DETECTED"
    REVIEW = "REVIEW"
    PAYOUT_READY = "PAYOUT_READY"

class TriggerType(str, Enum):
    HEAVY_RAIN = "HEAVY_RAIN"
    EXTREME_HEAT = "EXTREME_HEAT"
    SEVERE_AQI = "SEVERE_AQI"
    PLATFORM_DOWNTIME = "PLATFORM_DOWNTIME"
    TRAFFIC_DISRUPTION = "TRAFFIC_DISRUPTION"

class Event(BaseModel):
    event_id: str
    zone: str
    trigger_type: TriggerType
    severity: float # e.g. 1.0 to 2.0
    source: str # e.g. "MET_OFFICE", "SENSOR_GRID"
    start_time: datetime
    end_time: Optional[datetime] = None
    status: EventStatus = EventStatus.ACTIVE
    description: Optional[str] = None

class ValidationBreakdown(BaseModel):
    policy_active: bool = False
    trigger_covered: bool = False
    zone_match: bool = False
    within_policy_window: bool = False
    working_hours_overlap: bool = False
    earning_intent_detected: bool = False

class ImpactReasoning(BaseModel):
    event_duration_hours: float = 0.0
    overlap_with_work_hours: float = 0.0
    final_impacted_hours: float = 0.0

class Claim(BaseModel):
    claim_id: str
    event_id: str
    worker_id: str
    policy_id: str
    status: ClaimStatus = ClaimStatus.ELIGIBLE
    
    # Impact Metrics
    impacted_hours: float
    severity_factor: float
    trust_multiplier: float
    
    # Financials
    raw_payout: int
    final_payout: int
    estimated_loss: int
    protection_ratio: float
    uncovered_loss: int
    
    # Decision Metadata
    explanation: str
    why_eligible: Optional[str] = None
    rejection_reason: Optional[str] = None
    validation_breakdown: ValidationBreakdown = Field(default_factory=ValidationBreakdown)
    impact_reasoning: ImpactReasoning = Field(default_factory=ImpactReasoning)
    
    confidence_score: float # 0.0 to 1.0
    confidence_lane: str # HIGH, MEDIUM, REVIEW
    
    # ML Metadata
    risk_score_snapshot: float = 0.0
    trust_multiplier_used: float = 1.0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None

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
