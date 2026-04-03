from pydantic import BaseModel
from typing import Optional

class WorkerRegister(BaseModel):
    platform: str
    zone: str
    income_band: str

class WorkerInfo(BaseModel):
    worker_id: str
    phone: str
    platform: str
    zone: str
    income_band: str
    trust_score: float
