"""
api/v1/endpoints/events.py — Events API.

Endpoints:
    POST  /events/simulate   — Full pipeline: TriggerEngine → EventGenerator → background batch
    GET   /events/active     — List all ACTIVE events
    GET   /events/{event_id} — Single event detail
"""

import logging
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.db import session
from app.models.domain import Event, EventStatus
from app.schemas.event import (
    ActiveEventsResponse,
    EventResponse,
    EventSimulateData,
    EventSimulateRequest,
    GateBreakdown,
)
from app.schemas.generic import GlobalResponse, error, pending, success
from app.services.claim_generator import ClaimGenerator
from app.services.event_generator import EventGenerationEngine
from app.services.payout_engine import PayoutEngine
from app.services.trigger_engine import TriggerDecisionEngine

router = APIRouter()
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# POST /events/simulate
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/simulate", response_model=GlobalResponse)
async def simulate_event(
    request: EventSimulateRequest,
    background_tasks: BackgroundTasks,
) -> GlobalResponse:
    """
    Simulate a parametric trigger event.

    Flow (synchronous part):
        1. TriggerDecisionEngine.process_trigger() — Tri-Gate validation
        2. EventGenerationEngine.create_finalized_event() — immutable event
        3. Return gate breakdown + affected counts immediately

    Background task:
        4. ClaimGenerator.create_claims_for_event() — WIVE + claim gen for all zone workers
        5. PayoutEngine.execute_batch_payouts() — auto-payout HIGH lane claims
    """
    logger.info(
        "simulate_event: zone=%s trigger=%s severity=%.2f source=%s",
        request.zone, request.trigger_type, request.severity, request.source,
    )

    # ── Step 1: Tri-Gate Trigger Validation ───────────────────────────────────
    trigger_result = TriggerDecisionEngine.process_trigger(
        zone=request.zone,
        trigger_type=request.trigger_type,
        severity=request.severity,
        source=request.source,
    )

    gate_breakdown = GateBreakdown(
        environmental=trigger_result.gate_breakdown.environmental,
        economic=trigger_result.gate_breakdown.economic,
        temporal=trigger_result.gate_breakdown.temporal,
        gate_reasons=trigger_result.gate_breakdown.gate_reasons,
    )

    if not trigger_result.passed:
        logger.warning(
            "simulate_event: trigger REJECTED — %s", trigger_result.reason
        )
        return error(
            message=f"Trigger validation failed: {trigger_result.reason}",
            data=EventSimulateData(
                event=EventResponse(
                    event_id="NONE",
                    zone=request.zone,
                    trigger_type=request.trigger_type,
                    severity=request.severity,
                    source=request.source,
                    start_time=datetime.utcnow(),
                    status=EventStatus.EXPIRED,
                    description=request.description,
                ),
                gate_breakdown=gate_breakdown,
                trigger_passed=False,
                affected_worker_count=trigger_result.affected_worker_count,
                affected_policy_count=trigger_result.affected_policy_count,
                processing_started_at=datetime.utcnow().isoformat() + "Z",
            ).model_dump(),
        )

    # ── Step 2: Immutable Event Creation (ONE PER ZONE/TRIGGER) ──────────────
    gen_result = EventGenerationEngine.create_finalized_event(
        zone=request.zone,
        trigger_type=request.trigger_type,
        severity=request.severity,
        source=request.source,
        description=request.description,
    )
    event = gen_result.event
    processing_started_at = datetime.utcnow().isoformat() + "Z"

    # ── Step 3: Background claim + payout batch ───────────────────────────────
    background_tasks.add_task(
        _run_claim_and_payout_pipeline, event.event_id
    )

    event_resp = EventResponse(
        event_id=event.event_id,
        zone=event.zone,
        trigger_type=event.trigger_type,
        severity=event.severity,
        source=event.source,
        start_time=event.start_time,
        status=event.status,
        description=event.description,
    )

    simulate_data = EventSimulateData(
        event=event_resp,
        gate_breakdown=gate_breakdown,
        trigger_passed=True,
        affected_worker_count=trigger_result.affected_worker_count,
        affected_policy_count=trigger_result.affected_policy_count,
        processing_started_at=processing_started_at,
        merged_with_existing=gen_result.merged_with_existing,
        existing_event_id=gen_result.existing_event_id,
    )

    if gen_result.merged_with_existing:
        logger.info(
            "simulate_event: merged with existing event %s", gen_result.existing_event_id
        )
        return success(
            message=(
                f"Trigger validated. Merged with existing active event "
                f"({gen_result.existing_event_id}). "
                f"Background claim processing started."
            ),
            data=simulate_data.model_dump(),
        )

    return success(
        message=(
            f"Trigger validated. Event {event.event_id} created. "
            f"Background pipeline started for {trigger_result.affected_worker_count} workers."
        ),
        data=simulate_data.model_dump(),
    )


# ──────────────────────────────────────────────────────────────────────────────
# GET /events/active
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/active", response_model=ActiveEventsResponse)
async def get_active_events() -> ActiveEventsResponse:
    """Return all currently ACTIVE disruption events."""
    with session.db_lock:
        events_list = list(session.events.values())

    active_events = []
    for e in events_list:
        obj = e if isinstance(e, Event) else Event(**e)
        if obj.status == EventStatus.ACTIVE:
            active_events.append(
                EventResponse(
                    event_id=obj.event_id,
                    zone=obj.zone,
                    trigger_type=obj.trigger_type,
                    severity=obj.severity,
                    source=obj.source,
                    start_time=obj.start_time,
                    status=obj.status,
                    description=obj.description,
                )
            )

    return ActiveEventsResponse(events=active_events)


# ──────────────────────────────────────────────────────────────────────────────
# GET /events/{event_id}
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str) -> EventResponse:
    with session.db_lock:
        event_data = session.events.get(event_id)

    if not event_data:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found.")

    obj = event_data if isinstance(event_data, Event) else Event(**event_data)
    return EventResponse(
        event_id=obj.event_id,
        zone=obj.zone,
        trigger_type=obj.trigger_type,
        severity=obj.severity,
        source=obj.source,
        start_time=obj.start_time,
        status=obj.status,
        description=obj.description,
    )


# ──────────────────────────────────────────────────────────────────────────────
# Background pipeline task
# ──────────────────────────────────────────────────────────────────────────────

def _run_claim_and_payout_pipeline(event_id: str) -> None:
    """
    Background: generate claims for all zone workers, then auto-payout HIGH lane.
    Called from simulate_event background_tasks.
    """
    logger.info("Pipeline BG task starting for event=%s", event_id)

    with session.db_lock:
        event_data = session.events.get(event_id)
    if not event_data:
        logger.error("Pipeline BG: event %s not found", event_id)
        return

    event = event_data if isinstance(event_data, Event) else Event(**event_data)

    # Step 4: Claim generation (WIVE + ClaimGenerator for all zone workers)
    claims = ClaimGenerator.create_claims_for_event(event)

    # Step 5: Batch payout for HIGH-lane claims
    high_lane_claims = [c for c in claims if c.confidence_lane == "HIGH"]
    if high_lane_claims:
        results = PayoutEngine.execute_batch_payouts(high_lane_claims)
        logger.info(
            "Pipeline BG: batch payout done — %d paid for event=%s",
            len(results), event_id,
        )
    else:
        logger.info(
            "Pipeline BG: no HIGH-lane claims for event=%s — skipping batch payout",
            event_id,
        )
