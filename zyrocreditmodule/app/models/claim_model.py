from typing import Optional
from pydantic import BaseModel

class ClaimModel(BaseModel):
    """Internal model representing an idempotent Claim."""
    claim_id: str
    worker_id: str
    event_id: str
    status: str
    effective_loss_ratio: float
    severity_multiplier: float
    created_at: str
    payout_amount: Optional[int] = None
    payout_status: Optional[str] = None
