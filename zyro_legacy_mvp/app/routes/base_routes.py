from fastapi import APIRouter
from app.schemas.input_schema import ClaimInputSchema
from app.schemas.output_schema import GenericResponse

router = APIRouter()

@router.get("/", response_model=str)
async def health_check():
    """Minimal healthcheck endpoint."""
    return "ZyroCredit running"

@router.post("/test-input", response_model=GenericResponse)
async def test_input(payload: ClaimInputSchema):
    """
    Validates structure only for incoming payloads.
    Input validation is completely handled by FastAPI/Pydantic
    based on ClaimInputSchema constraints.
    """
    return GenericResponse(
        status="SUCCESS",
        message="Payload validated successfully",
        data=payload.model_dump()
    )
