from pydantic import BaseModel

class PaymentModel(BaseModel):
    """Internal model representing an idempotent Payment mapping."""
    transaction_id: str
    claim_id: str
    worker_id: str
    amount: int
    status: str
    timestamp: str
