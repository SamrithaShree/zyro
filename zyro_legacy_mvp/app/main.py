from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.routes.base_routes import router as base_router
from app.routes.claim_routes import router as claim_router
from app.routes.payout_routes import router as payout_router
from app.routes.payment_routes import router as payment_router
from app.schemas.output_schema import GenericResponse

app = FastAPI(title="ZyroCredit Foundation")

# Global Exception Handler for missing fields, invalid types, empty sets, etc.
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Overrides default FastAPI 422 explicitly to the demanded structure."""
    return JSONResponse(
        status_code=422,
        content=GenericResponse(
            status="ERROR",
            message="Invalid input", # Exact required error message from request instructions
            data=exc.errors()
        ).model_dump()
    )

app.include_router(base_router)
app.include_router(claim_router)
app.include_router(payout_router)
app.include_router(payment_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
