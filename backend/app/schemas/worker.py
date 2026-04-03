from pydantic import BaseModel, Field
from typing import Optional

class LocationRequest(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    city: Optional[str] = "Chennai"
    zone: Optional[str] = None

class WorkProfileRequest(BaseModel):
    platform: str
    working_hours_per_day: int
    days_worked_per_week: int
    income_band: str # Must match pricing_logic.INCOME_BAND_TO_HOURLY_BENEFIT

class UPIRequest(BaseModel):
    upi_id: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+$")

class WorkerRegister(BaseModel):
    # This is now just a trigger since all data is in session
    confirm: bool = True

class WorkerInfo(BaseModel):
    worker_id: str
    phone: str
    platform: str
    zone: str
    city: str
    income_band: str
    upi_id: str
    masked_aadhaar: str
    trust_score: float
    worker_badge: str
