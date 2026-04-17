"""
services/event_generator.py — Immutable Event Generation Engine.

Pipeline step 2:
    EventGenerationEngine.create_finalized_event(zone, trigger_type, severity, source, description)
    → EventGeneratorResult(event, is_new, merged_with_existing, existing_event_id)

Rules:
  - ONE ACTIVE EVENT PER ZONE+TRIGGER_TYPE at any time
  - If an active event exists for the same zone+trigger, merge (update severity if higher)
  - Event ID is immutable once created
  - All writes are inside db_lock (atomic)
"""

import logging
import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from app.db import session
from app.models.domain import Event, EventStatus, TriggerType

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# Result dataclass
# ──────────────────────────────────────────────────────────────────────────────

@dataclass
class EventGeneratorResult:
    event: Event
    is_new: bool
    merged_with_existing: bool
    existing_event_id: Optional[str]


# ──────────────────────────────────────────────────────────────────────────────
# Engine
# ──────────────────────────────────────────────────────────────────────────────

class EventGenerationEngine:
    """
    Creates or merges Events.  All public methods are thread-safe.
    """

    @staticmethod
    def create_finalized_event(
        zone: str,
        trigger_type: TriggerType,
        severity: float,
        source: str,
        description: Optional[str] = None,
    ) -> EventGeneratorResult:
        """
        Enforce ONE ACTIVE EVENT PER ZONE/TRIGGER and return the canonical event.

        If an active event already exists for (zone, trigger_type):
            - If incoming severity > existing  →  update severity (merge)
            - Either way, return existing event with merged_with_existing=True

        Otherwise: create a new immutable Event and store it.

        Returns:
            EventGeneratorResult
        """
        # ── Check for existing ACTIVE event in this zone+trigger_type ─────────
        existing = EventGenerationEngine._find_active_event(zone, trigger_type)

        if existing:
            logger.info(
                "EventGenerator: active event %s found for zone=%s trigger=%s — merging",
                existing.event_id, zone, trigger_type,
            )
            merged_event = EventGenerationEngine._merge_event(existing, severity, source)
            return EventGeneratorResult(
                event=merged_event,
                is_new=False,
                merged_with_existing=True,
                existing_event_id=existing.event_id,
            )

        # ── Create new immutable event ─────────────────────────────────────────
        event_id = f"evt_{uuid.uuid4().hex[:10]}"
        event = Event(
            event_id=event_id,
            zone=zone,
            trigger_type=trigger_type,
            severity=severity,
            source=source,
            start_time=datetime.utcnow(),
            status=EventStatus.ACTIVE,
            description=description,
        )

        with session.db_lock:
            session.events[event_id] = event

        logger.info(
            "EventGenerator: created new event %s zone=%s trigger=%s severity=%.2f",
            event_id, zone, trigger_type, severity,
        )
        return EventGeneratorResult(
            event=event,
            is_new=True,
            merged_with_existing=False,
            existing_event_id=None,
        )

    # ── Internal helpers ──────────────────────────────────────────────────────

    @staticmethod
    def _find_active_event(zone: str, trigger_type: TriggerType) -> Optional[Event]:
        """Return first ACTIVE event matching zone + trigger_type, or None."""
        with session.db_lock:
            events_snapshot = list(session.events.values())

        for ed in events_snapshot:
            e = ed if isinstance(ed, Event) else Event(**ed)
            if (
                e.status == EventStatus.ACTIVE
                and e.zone == zone
                and e.trigger_type == trigger_type
            ):
                return e
        return None

    @staticmethod
    def _merge_event(existing: Event, incoming_severity: float, source: str) -> Event:
        """
        Merge strategy: take the higher severity, update source if different.
        Updates in-place inside db_lock.
        """
        with session.db_lock:
            current = session.events.get(existing.event_id)
            if current is None:
                return existing

            ev = current if isinstance(current, Event) else Event(**current)

            if incoming_severity > ev.severity:
                logger.info(
                    "EventGenerator: merging severity %.2f → %.2f for event %s",
                    ev.severity, incoming_severity, ev.event_id,
                )
                ev = ev.model_copy(update={"severity": incoming_severity, "source": source})

            session.events[ev.event_id] = ev
            return ev

    @staticmethod
    def resolve_event(event_id: str) -> bool:
        """Mark an event as RESOLVED. Returns True if successful."""
        with session.db_lock:
            ev_data = session.events.get(event_id)
            if not ev_data:
                return False
            ev = ev_data if isinstance(ev_data, Event) else Event(**ev_data)
            if ev.status != EventStatus.ACTIVE:
                return False
            ev = ev.model_copy(update={"status": EventStatus.RESOLVED, "end_time": datetime.utcnow()})
            session.events[event_id] = ev
        logger.info("EventGenerator: event %s resolved", event_id)
        return True
