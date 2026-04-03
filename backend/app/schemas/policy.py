from pydantic import BaseModel

class AcknowledgementRequest(BaseModel):
    premium_acknowledged: bool
    coverage_acknowledged: bool
    exclusions_acknowledged: bool
    terms_accepted: bool
    privacy_accepted: bool

class PolicyQuoteRequest(BaseModel):
    zone: str
    income_band: str

class PolicyQuote(BaseModel):
    premium_amount: int
    hourly_benefit: int
    weekly_cap: int

class PolicyActivationResponse(BaseModel):
    policy_id: str
    status: str
    valid_until: str
