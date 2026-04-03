from fastapi import APIRouter
from app.schemas.input_schema import PayoutRequestSchema
from app.schemas.output_schema import PayoutResponse
from app.services.base_service import calculate_payout

router = APIRouter(prefix="/payouts", tags=["Payouts"])

@router.post("/calculate", response_model=PayoutResponse)
async def calculate_payout_endpoint(payload: PayoutRequestSchema):
    """
    Endpoint mapping Approved claims into Parametric Payout determinations.
    Missing fields or bad formatting instantly returned as 422 logic handled globally.
    """
    result = calculate_payout(payload)
    return PayoutResponse(**result)
