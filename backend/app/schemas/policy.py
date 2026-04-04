from pydantic import BaseModel
from typing import List, Optional

class AcknowledgementRequest(BaseModel):
    premium_acknowledged: bool
    coverage_acknowledged: bool
    exclusions_acknowledged: bool
    terms_accepted: bool
    privacy_accepted: bool

class PolicyQuoteRequest(BaseModel):
    # For Phase 2, we fetch these from the worker profile if not provided
    zone: Optional[str] = None
    income_band: Optional[str] = None

class PlanOption(BaseModel):
    tier: str
    premium_amount: int
    hourly_benefit: int
    weekly_cap: int
    covered_triggers: List[str]
    replacement_fraction: float
    expected_weekly_loss: int
    intended_protection_level: str
    pricing_drivers: List[str]
    explanation: str

class PolicyRecommendationResponse(BaseModel):
    recommended_tier: str
    estimated_weekly_loss: int
    plans: List[PlanOption]

class PolicyActivationRequest(BaseModel):
    tier: str # Basic, Standard, Premium

class PolicyActivationResponse(BaseModel):
    policy_id: str
    status: str
    valid_until: str
    tier: str
    premium_amount: int
    hourly_benefit: int
    weekly_cap: int

class DashboardPolicyStatus(BaseModel):
    has_active_policy: bool
    policy_details: Optional[PlanOption] = None
    remaining_cap: Optional[int] = None
    coverage_window: Optional[str] = None # e.g. "Apr 3 - Apr 10"
