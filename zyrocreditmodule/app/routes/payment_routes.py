from fastapi import APIRouter
from app.schemas.input_schema import PaymentRequestSchema
from app.schemas.output_schema import PaymentResponse
from app.services.base_service import execute_payment

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/execute", response_model=PaymentResponse)
async def execute_payment_endpoint(payload: PaymentRequestSchema):
    """
    Endpoint translating deterministic calculations into mocked financial transactions dynamically bounding bounds.
    Missing fields instantly result in cleanly handled framework validation structures.
    """
    result = execute_payment(payload)
    return PaymentResponse(**result)
