from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List
from app.schemas.event import EventSimulateRequest, EventResponse, ActiveEventsResponse
from app.services.automation import AutomationService
from app.db import session
from app.models.domain import Event, EventStatus

router = APIRouter()

@router.post("/simulate", response_model=EventResponse)
async def simulate_event(request: EventSimulateRequest, background_tasks: BackgroundTasks):
    """
    Simulate a parametric trigger event.
    Triggers the WIVE-style worker validation and auto-claim generation.
    """
    event = AutomationService.create_event(
        zone=request.zone,
        trigger_type=request.trigger_type,
        severity=request.severity,
        source=request.source,
        description=request.description
    )
    
    # Auto-process event in background
    background_tasks.add_task(AutomationService.process_event, event.event_id)
    
    return event.model_dump(mode="json")

@router.get("/active", response_model=ActiveEventsResponse)
async def get_active_events():
    """
    Get all currently active disruption events.
    """
    with session.db_lock:
        events_list = list(session.events.values())
        
    active_events = []
    for e in events_list:
        # Robustly handle both dict and Event objects
        obj = e if isinstance(e, Event) else Event(**e)
        if obj.status == EventStatus.ACTIVE:
            active_events.append(obj.model_dump(mode="json"))
            
    return {"events": active_events}

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    event_data = session.events.get(event_id)
    if not event_data:
        raise HTTPException(status_code=404, detail="Event not found")
    
    obj = event_data if isinstance(event_data, Event) else Event(**event_data)
    return obj.model_dump(mode="json")
