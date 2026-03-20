from fastapi import APIRouter
from app.schemas.input_schema import ClaimInputSchema
from app.schemas.output_schema import ClaimResponse
from app.services.base_service import create_claim

router = APIRouter(prefix="/claims", tags=["Claims"])

@router.post("/create", response_model=ClaimResponse)
async def create_claim_endpoint(payload: ClaimInputSchema):
    """
    Endpoint mapping WIVE event validations into ZyroCredit idempotent claims.
    Missing fields or bad formatting instantly returned as 422 logic handled globally.
    """
    result = create_claim(payload)
    return ClaimResponse(**result)
