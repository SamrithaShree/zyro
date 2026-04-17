"""
app/schemas/event.py — Event request/response schemas.
"""

from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime
from app.models.domain import EventStatus, TriggerType


class EventSimulateRequest(BaseModel):
    zone: str
    trigger_type: TriggerType
    severity: float           # 1.0 – 1.5
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


# ── Full pipeline simulate response (API contract) ─────────────────────────────

class GateBreakdown(BaseModel):
    """Environmental / Economic / Temporal Tri-Gate results."""
    environmental: bool = False
    economic: bool = False
    temporal: bool = False
    gate_reasons: Dict[str, str] = {}


class EventSimulateData(BaseModel):
    """Inner `data` payload for POST /events/simulate response."""
    event: EventResponse
    gate_breakdown: GateBreakdown
    trigger_passed: bool
    affected_worker_count: int
    affected_policy_count: int
    processing_started_at: str      # ISO-8601
    merged_with_existing: bool = False
    existing_event_id: Optional[str] = None
