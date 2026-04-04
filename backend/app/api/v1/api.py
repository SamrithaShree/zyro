from fastapi import APIRouter
from app.api.v1.endpoints import auth, workers, policies, claims, events

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(workers.router, prefix="/workers", tags=["workers"])
api_router.include_router(policies.router, prefix="/policies", tags=["policies"])
api_router.include_router(claims.router, prefix="/claims", tags=["claims"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
