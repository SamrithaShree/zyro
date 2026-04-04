import uuid
import random
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Tuple
from app.db import session
from app.models.domain import (
    Event, EventStatus, Claim, ClaimStatus, TriggerType, Worker, Policy,
    ValidationBreakdown, ImpactReasoning
)
from app.services.ml.trust_model import compute_trust_multiplier
from app.services.ml.risk_model import compute_risk_score

class AutomationService:
    @staticmethod
    def create_event(zone: str, trigger_type: TriggerType, severity: float, source: str, description: Optional[str] = None) -> Event:
        event_id = f"evt_{uuid.uuid4().hex[:8]}"
        event = Event(
            event_id=event_id,
            zone=zone,
            trigger_type=trigger_type,
            severity=severity,
            source=source,
            start_time=datetime.utcnow(),
            status=EventStatus.ACTIVE,
            description=description
        )
        
        with session.db_lock:
            session.events[event_id] = event
            
        return event

    @staticmethod
    def process_event(event_id: str):
        event_data = session.events.get(event_id)
        if not event_data:
            return
            
        event = event_data if isinstance(event_data, Event) else Event(**event_data)
        if event.status != EventStatus.ACTIVE:
            return

        # Iterate through ALL workers in the zone to create either ELIGIBLE or REJECTED claims
        # This ensures demo visibility for why some were excluded
        with session.db_lock:
            all_workers = list(session.workers.values())

        for worker_data in all_workers:
            worker = worker_data if isinstance(worker_data, Worker) else Worker(**worker_data)
            
            # Only process workers in the same zone for demo efficiency
            if worker.zone != event.zone:
                continue
                
            AutomationService.evaluate_and_create_claim(event, worker)

    @staticmethod
    def evaluate_and_create_claim(event: Event, worker: Worker) -> Optional[Claim]:
        # Idempotency Check: (worker_id + event_id)
        with session.db_lock:
            for claim_data in session.claims.values():
                c = claim_data if isinstance(claim_data, Claim) else Claim(**claim_data)
                if c.worker_id == worker.worker_id and c.event_id == event.event_id:
                    return c

        breakdown = ValidationBreakdown(zone_match=True)
        rejection_reason = None
        
        # 1. Find Active Policy
        active_policy = None
        with session.db_lock:
            for policy_data in session.policies.values():
                p = policy_data if isinstance(policy_data, Policy) else Policy(**policy_data)
                if p.worker_id == worker.worker_id and p.status == "ACTIVE":
                    active_policy = p
                    break
        
        if active_policy:
            breakdown.policy_active = True
            # Check policy window
            now = datetime.utcnow()
            if active_policy.valid_from <= now <= active_policy.valid_until:
                breakdown.within_policy_window = True
            else:
                rejection_reason = "Event occurred outside of policy validity window."
        else:
            rejection_reason = "No active Zyro policy found for worker."

        # 2. Trigger Coverage
        # Normalize event trigger name to match policy coverage names
        trigger_map = {
            "HEAVY_RAIN": "RAIN",
            "TRAFFIC_DISRUPTION": "TRAFFIC",
            "SEVERE_AQI": "AIR_QUALITY",
            "EXTREME_HEAT": "HEAT",
            "PLATFORM_DOWNTIME": "PLATFORM_DOWNTIME"
        }
        normalized_trigger = trigger_map.get(event.trigger_type.value, event.trigger_type.value)

        if active_policy and normalized_trigger in active_policy.covered_triggers:
            breakdown.trigger_covered = True
        elif active_policy:
            rejection_reason = f"Your policy does not cover {normalized_trigger} (from {event.trigger_type.value})."

        # 3. Working Hours Overlap & Earning Intent (Simulated for Demo)
        # In a real system, we'd check telemetry. Here we use worker.working_hours_per_day
        # and assume the event happened during their typical shift.
        breakdown.working_hours_overlap = True # Mock: Assume overlap for demo workers in zone
        breakdown.earning_intent_detected = True # Mock: WIVE detection

        # 4. Impact Reasoning Calculation
        event_duration = 4.0 # Assume 4 hours for demo events
        
        # ML-Inspired Impact estimation
        # We assume an overlap factor based on how much of the day is covered by the event
        overlap_factor = min(event_duration / worker.working_hours_per_day, 1.0)
        base_impact = worker.working_hours_per_day * overlap_factor
        
        # Add slight randomness (+/- 10%) for realism
        variation = base_impact * random.uniform(-0.1, 0.1)
        final_impact = min(base_impact + variation, event_duration)
        final_impact = round(max(final_impact, 0.5), 2) # Min 0.5h impact

        impact_reasoning = ImpactReasoning(
            event_duration_hours=event_duration,
            overlap_with_work_hours=base_impact,
            final_impacted_hours=final_impact
        )

        is_eligible = breakdown.policy_active and breakdown.trigger_covered and breakdown.within_policy_window
        
        return AutomationService.finalize_claim(
            event, worker, active_policy, 
            is_eligible, breakdown, impact_reasoning, rejection_reason
        )

    @staticmethod
    def finalize_claim(
        event: Event, 
        worker: Worker, 
        policy: Optional[Policy], 
        is_eligible: bool,
        breakdown: ValidationBreakdown,
        impact_reasoning: ImpactReasoning,
        rejection_reason: Optional[str]
    ) -> Claim:
        claim_id = f"clm_{uuid.uuid4().hex[:8]}"
        
        # Payout Logic (only if eligible)
        impacted_hours = impact_reasoning.final_impacted_hours
        severity_factor = min(max(event.severity, 1.0), 1.2) # Tightened range [1.0, 1.2]
        
        # ML-Powered Trust Multiplier
        trust_multiplier = compute_trust_multiplier(worker, event)
        
        # Risk Score Snapshot for demo
        risk_score, risk_label, _ = compute_risk_score(worker.dict(), worker.zone)
        
        raw_payout = 0
        final_payout = 0
        estimated_loss = 0
        protection_ratio = 0.0
        uncovered_loss = 0
        
        if is_eligible and policy:
            raw_payout = int(policy.hourly_benefit * impacted_hours * severity_factor * trust_multiplier)
            final_payout = min(raw_payout, policy.remaining_cap)
            
            weekly_working_hours = policy.working_hours_snapshot
            estimated_loss = int(policy.income_estimate_snapshot * (impacted_hours / weekly_working_hours))
            protection_ratio = round(final_payout / estimated_loss, 2) if estimated_loss > 0 else 1.0
            uncovered_loss = max(estimated_loss - final_payout, 0)

        # Explanation Quality
        if is_eligible:
            trust_bonus_msg = ""
            if trust_multiplier > 1.0:
                trust_bonus_msg = f" Your trust multiplier was increased to {trust_multiplier} due to consistent behavior."
            elif trust_multiplier < 1.0:
                trust_bonus_msg = f" A trust multiplier of {trust_multiplier} was applied to this new account."

            explanation = (
                f"You lost ~{impacted_hours} working hours due to {event.trigger_type.value} in your zone. "
                f"Based on your policy, ₹{policy.hourly_benefit}/hour was applied, adjusted by severity."
                f"{trust_bonus_msg}"
            )
            why_eligible = f"Active {policy.tier} coverage detected during {event.trigger_type.value} disruption in {event.zone}."
            status = ClaimStatus.ELIGIBLE
        else:
            explanation = f"Claim could not be processed: {rejection_reason}"
            why_eligible = None
            status = ClaimStatus.REJECTED

        # Confidence Lane
        confidence_lane = "HIGH" if worker.trust_score >= 80 and trust_multiplier >= 1.0 else "REVIEW"

        claim = Claim(
            claim_id=claim_id,
            event_id=event.event_id,
            worker_id=worker.worker_id,
            policy_id=policy.policy_id if policy else "NONE",
            status=status,
            impacted_hours=impacted_hours,
            severity_factor=severity_factor,
            trust_multiplier=trust_multiplier,
            trust_multiplier_used=trust_multiplier,
            raw_payout=raw_payout,
            final_payout=final_payout,
            estimated_loss=estimated_loss,
            protection_ratio=protection_ratio,
            uncovered_loss=uncovered_loss,
            explanation=explanation,
            why_eligible=why_eligible,
            rejection_reason=rejection_reason,
            validation_breakdown=breakdown,
            impact_reasoning=impact_reasoning,
            confidence_score=worker.trust_score / 100.0,
            confidence_lane=confidence_lane,
            risk_score_snapshot=risk_score
        )
        
        with session.db_lock:
            session.claims[claim_id] = claim
            
        return claim

    @staticmethod
    def execute_payout(claim_id: str) -> bool:
        with session.db_lock:
            claim_data = session.claims.get(claim_id)
            if not claim_data:
                return False
            
            claim = claim_data if isinstance(claim_data, Claim) else Claim(**claim_data)
            if claim.status != ClaimStatus.ELIGIBLE:
                return False
            
            policy_data = session.policies.get(claim.policy_id)
            if policy_data:
                policy = policy_data if isinstance(policy_data, Policy) else Policy(**policy_data)
                policy.remaining_cap -= claim.final_payout
                session.policies[claim.policy_id] = policy
            
            claim.status = ClaimStatus.PAID
            claim.processed_at = datetime.utcnow()
            session.claims[claim_id] = claim
            
            return True
