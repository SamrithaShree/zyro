from typing import Optional, Any
from pydantic import BaseModel

class GenericResponse(BaseModel):
    """Standardized API response contract."""
    status: str
    message: str
    data: Optional[Any] = None

class ClaimResponse(BaseModel):
    """Response specifically tailored for the Claim Creation hook."""
    status: str
    claim_id: Optional[str] = None
    message: Optional[str] = None

class PayoutResponse(BaseModel):
    """Response returned exactly mapping Stage 3 mathematical limits."""
    status: str
    payout: Optional[int] = None
    message: Optional[str] = None

class PaymentResponse(BaseModel):
    """Response returned describing isolated payment outputs mappings preventing dual-pay."""
    status: str
    transaction_id: Optional[str] = None
    amount: Optional[int] = None
    message: Optional[str] = None
