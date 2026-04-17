"""
app/schemas/claim.py — Claim request/response schemas.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.domain import ClaimStatus, ValidationBreakdown, ImpactReasoning


class ClaimResponse(BaseModel):
    claim_id: str
    event_id: str
    worker_id: str
    policy_id: str
    status: ClaimStatus

    # Financials — both field name and alias exposed
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
    confidence_score: float
    risk_score: float = Field(..., alias="risk_score_snapshot")
    trust_multiplier: float = Field(..., alias="trust_multiplier_used")
    created_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        populate_by_name = True    # Pydantic v2 replacement for allow_population_by_field_name


class ClaimSummary(BaseModel):
    total_claims: int
    total_payout: int
    pending_review: int


# ── Payout response (POST /claims/{id}/payout) ────────────────────────────────

class PayoutResponse(BaseModel):
    """Returned inside GlobalResponse.data for payout endpoint."""
    transaction_id: str
    claim_id: str
    amount_rs: int
    upi_id: Optional[str]
    idempotency_key: str
    processed_at: str       # ISO-8601
    already_processed: bool = False


# ── Admin claim create (POST /claims/create) ──────────────────────────────────

class ClaimCreateRequest(BaseModel):
    """Admin/internal endpoint: manually trigger WIVE + ClaimGenerator."""
    worker_id: str
    event_id: str
