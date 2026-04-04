from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.domain import EventStatus, TriggerType

class EventSimulateRequest(BaseModel):
    zone: str
    trigger_type: TriggerType
    severity: float # e.g. 1.0 to 1.5
    source: str = "MET_OFFICE"
    description: Optional[str] = None

class EventResponse(BaseModel):
    event_id: str
    zone: str
    trigger_type: TriggerType
    severity: float
    source: str
    start_time: datetime
    status: EventStatus
    description: Optional[str] = None

class ActiveEventsResponse(BaseModel):
    events: List[EventResponse]
