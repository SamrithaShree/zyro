"""
services/trigger_engine.py — Tri-Gate Trigger Decision Engine.

Pipeline step 1:
    TriggerDecisionEngine.process_trigger(zone, trigger_type, severity, source)
    → TriggerResult(passed, gate_breakdown, reason)

Three gates that ALL must pass for an event to be created:
    Gate 1 — Environmental : severity meets per-trigger threshold
    Gate 2 — Economic      : zone has at least one worker with an active policy
    Gate 3 — Temporal      : simulation time is within operational hours (06:00–23:00 IST)
"""

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import Dict, Optional

from app.db import session
from app.models.domain import Policy, TriggerType, Worker

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────────────────────

# Minimum severity required for each trigger type to pass the environmental gate
SEVERITY_THRESHOLDS: Dict[str, float] = {
    TriggerType.HEAVY_RAIN: 1.1,
    TriggerType.EXTREME_HEAT: 1.1,
    TriggerType.SEVERE_AQI: 1.15,
    TriggerType.PLATFORM_DOWNTIME: 1.0,   # Any downtime is sufficient
    TriggerType.TRAFFIC_DISRUPTION: 1.1,
}

# IST offset
IST = timezone(timedelta(hours=5, minutes=30))
OPERATIONAL_START_HOUR = 6   # 06:00 IST
OPERATIONAL_END_HOUR = 23    # 23:00 IST

# Trigger-type → normalized policy coverage token (matches covered_triggers list)
TRIGGER_COVERAGE_MAP: Dict[str, str] = {
    TriggerType.HEAVY_RAIN: "RAIN",
    TriggerType.TRAFFIC_DISRUPTION: "TRAFFIC",
    TriggerType.SEVERE_AQI: "AIR_QUALITY",
    TriggerType.EXTREME_HEAT: "HEAT",
    TriggerType.PLATFORM_DOWNTIME: "PLATFORM_DOWNTIME",
}


# ──────────────────────────────────────────────────────────────────────────────
# Data classes
# ──────────────────────────────────────────────────────────────────────────────

@dataclass
class GateBreakdown:
    environmental: bool = False
    economic: bool = False
    temporal: bool = False
    gate_reasons: Dict[str, str] = field(default_factory=dict)

    @property
    def all_passed(self) -> bool:
        return self.environmental and self.economic and self.temporal


@dataclass
class TriggerResult:
    passed: bool
    gate_breakdown: GateBreakdown
    reason: str
    affected_worker_count: int = 0
    affected_policy_count: int = 0


# ──────────────────────────────────────────────────────────────────────────────
# Engine
# ──────────────────────────────────────────────────────────────────────────────

class TriggerDecisionEngine:
    """
    Stateless Tri-Gate trigger validation engine.
    All methods are pure functions (no side effects on the DB).
    """

    @staticmethod
    def process_trigger(
        zone: str,
        trigger_type: TriggerType,
        severity: float,
        source: str,
    ) -> TriggerResult:
        """
        Run all three gates and return a TriggerResult.

        Args:
            zone:         Geographic zone identifier (e.g. "Velachery")
            trigger_type: TriggerType enum value
            severity:     Float 1.0–2.0
            source:       Data source string ("MET_OFFICE", "SENSOR_GRID", etc.)

        Returns:
            TriggerResult with gate_breakdown and counts
        """
        logger.info(
            "TriggerEngine: evaluating zone=%s trigger=%s severity=%.2f source=%s",
            zone, trigger_type, severity, source,
        )

        breakdown = GateBreakdown()

        # ── Gate 1: Environmental ─────────────────────────────────────────────
        threshold = SEVERITY_THRESHOLDS.get(trigger_type, 1.0)
        if severity >= threshold:
            breakdown.environmental = True
            breakdown.gate_reasons["environmental"] = (
                f"Severity {severity:.2f} ≥ threshold {threshold:.2f} for {trigger_type}"
            )
        else:
            breakdown.gate_reasons["environmental"] = (
                f"Severity {severity:.2f} below threshold {threshold:.2f} for {trigger_type}"
            )
            logger.info("TriggerEngine: Environmental gate FAILED")
            return TriggerResult(
                passed=False,
                gate_breakdown=breakdown,
                reason=breakdown.gate_reasons["environmental"],
            )

        # ── Gate 2: Economic (zone has eligible workers + policies) ───────────
        workers_in_zone, policies_for_zone = TriggerDecisionEngine._count_zone_eligibles(
            zone, trigger_type
        )

        if policies_for_zone > 0:
            breakdown.economic = True
            breakdown.gate_reasons["economic"] = (
                f"{workers_in_zone} workers in zone; {policies_for_zone} active covering policies"
            )
        else:
            breakdown.gate_reasons["economic"] = (
                f"No active policies covering {trigger_type} found in zone {zone}"
            )
            logger.info("TriggerEngine: Economic gate FAILED")
            return TriggerResult(
                passed=False,
                gate_breakdown=breakdown,
                reason=breakdown.gate_reasons["economic"],
                affected_worker_count=workers_in_zone,
                affected_policy_count=0,
            )

        # ── Gate 3: Temporal (operational hours check) ────────────────────────
        now_ist = datetime.now(IST)
        hour = now_ist.hour
        if OPERATIONAL_START_HOUR <= hour < OPERATIONAL_END_HOUR:
            breakdown.temporal = True
            breakdown.gate_reasons["temporal"] = (
                f"Current time {now_ist.strftime('%H:%M')} IST is within operational window"
            )
        else:
            breakdown.gate_reasons["temporal"] = (
                f"Current time {now_ist.strftime('%H:%M')} IST is outside operational window "
                f"({OPERATIONAL_START_HOUR:02d}:00–{OPERATIONAL_END_HOUR:02d}:00)"
            )
            logger.info("TriggerEngine: Temporal gate FAILED")
            return TriggerResult(
                passed=False,
                gate_breakdown=breakdown,
                reason=breakdown.gate_reasons["temporal"],
                affected_worker_count=workers_in_zone,
                affected_policy_count=policies_for_zone,
            )

        logger.info(
            "TriggerEngine: ALL gates PASSED — workers=%d policies=%d",
            workers_in_zone, policies_for_zone,
        )
        return TriggerResult(
            passed=True,
            gate_breakdown=breakdown,
            reason="All three gates passed. Event creation authorized.",
            affected_worker_count=workers_in_zone,
            affected_policy_count=policies_for_zone,
        )

    # ── Internal helpers ──────────────────────────────────────────────────────

    @staticmethod
    def _count_zone_eligibles(
        zone: str, trigger_type: TriggerType
    ) -> tuple[int, int]:
        """
        Count workers in zone and active policies that cover this trigger.
        Read-only, takes lock once for efficiency.
        """
        coverage_token = TRIGGER_COVERAGE_MAP.get(trigger_type, trigger_type.value)
        workers_in_zone: int = 0
        policies_covering: int = 0

        with session.db_lock:
            all_workers = list(session.workers.values())
            all_policies = list(session.policies.values())

        for wd in all_workers:
            w = wd if isinstance(wd, Worker) else Worker(**wd)
            if w.zone == zone:
                workers_in_zone += 1

        now = datetime.utcnow()
        for pd in all_policies:
            p = pd if isinstance(pd, Policy) else Policy(**pd)
            if (
                p.status == "ACTIVE"
                and p.valid_from <= now <= p.valid_until
                and coverage_token in p.covered_triggers
            ):
                # Policy belongs to a worker in this zone?
                with session.db_lock:
                    worker_data = session.workers.get(p.worker_id)
                if worker_data:
                    w2 = worker_data if isinstance(worker_data, Worker) else Worker(**worker_data)
                    if w2.zone == zone:
                        policies_covering += 1

        return workers_in_zone, policies_covering
