from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.domain import ClaimStatus, TriggerType, ValidationBreakdown, ImpactReasoning

class ClaimResponse(BaseModel):
    claim_id: str
    event_id: str
    worker_id: str
    policy_id: str
    status: ClaimStatus
    
    # Financials
    payout_amount: int = Field(..., alias="final_payout")
    estimated_loss: int
    protection_ratio: float
    uncovered_loss: int
    
    # Transparency & Reasoning
    explanation: str
    why_eligible: Optional[str] = None
    rejection_reason: Optional[str] = None
    validation_breakdown: ValidationBreakdown
    impact_reasoning: ImpactReasoning
    
    # Metadata
    confidence_lane: str
    risk_score: float = Field(..., alias="risk_score_snapshot")
    trust_multiplier: float = Field(..., alias="trust_multiplier_used")
    created_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True

class ClaimSummary(BaseModel):
    total_claims: int
    total_payout: int
    pending_review: int
