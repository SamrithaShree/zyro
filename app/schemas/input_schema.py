from pydantic import BaseModel, ConfigDict

class ClaimInputSchema(BaseModel):
    """API contract for expected claim inputs coming from WIVE."""
    worker_id: str
    event_id: str
    final_status: str
    effective_loss_ratio: float
    severity_multiplier: float
    
    # Ignore extra unexpectedly added fields to handle edge cases
    model_config = ConfigDict(extra="ignore")

class PayoutRequestSchema(BaseModel):
    """API contract triggering deterministic payout engine checks."""
    claim_id: str
    
    model_config = ConfigDict(extra="ignore")

class PaymentRequestSchema(BaseModel):
    """API contract triggering external mock gateway executions executing payouts cleanly mapping."""
    claim_id: str
    
    model_config = ConfigDict(extra="ignore")
