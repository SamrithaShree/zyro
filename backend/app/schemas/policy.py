from pydantic import BaseModel
from datetime import datetime

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
    valid_until: datetime
