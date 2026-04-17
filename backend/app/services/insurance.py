import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from app.db import session as db
from app.models.domain import Worker, Policy
from app.core.pricing_logic import get_plan_options, INCOME_BAND_TO_VALUE
from app.services.ml.risk_model import compute_risk_score
from app.services.ml.disruption_model import predict_disruption_probability

def register_worker(
    phone: str, 
    platform: str, 
    zone: str, 
    income_band: str,
    working_hours_per_day: int,
    days_worked_per_week: int,
    upi_id: str,
    masked_aadhaar: str,
    city: str = "Chennai"
) -> Worker:
    worker_id = f"W-{uuid.uuid4().hex[:8].upper()}"
    
    with db.db_lock:
        if phone in db.phone_to_worker_id:
            return db.workers[db.phone_to_worker_id[phone]]
            
        worker = Worker(
            worker_id=worker_id,
            phone=phone,
            platform=platform,
            zone=zone,
            city=city,
            income_band=income_band,
            working_hours_per_day=working_hours_per_day,
            days_worked_per_week=days_worked_per_week,
            upi_id=upi_id,
            masked_aadhaar=masked_aadhaar,
            worker_badge="ZYRO_VERIFIED"
        )
        db.workers[worker_id] = worker
        db.phone_to_worker_id[phone] = worker_id
        
    return worker

def get_worker_by_id(worker_id: str) -> Optional[Worker]:
    with db.db_lock:
        return db.workers.get(worker_id)

def get_policy_recommendations(worker: Worker) -> Dict[str, Any]:
    # 1. Compute ML Insights
    risk_score, risk_label, base_reason, factors = compute_risk_score(worker.dict(), worker.zone)
    
    # Base triggers for probability estimation
    base_triggers = ["HEAVY_RAIN", "TRAFFIC_DISRUPTION", "PLATFORM_DOWNTIME"]
    disruption_prob = predict_disruption_probability(worker.zone, base_triggers)
    
    # 2. Get Plan Options
    plans = get_plan_options(
        worker.income_band, 
        worker.zone, 
        worker.working_hours_per_day, 
        worker.days_worked_per_week
    )
    
    # 3. Smart Recommendation Logic
    if risk_label == "HIGH":
        recommended_tier = "Premium"
    elif risk_label == "MEDIUM":
        recommended_tier = "Standard"
    else:
        recommended_tier = "Basic"
        
    estimated_weekly_loss = plans[0]["expected_weekly_loss"]
    
    return {
        "recommended_tier": recommended_tier,
        "estimated_weekly_loss": estimated_weekly_loss,
        "plans": plans,
        "risk_score": risk_score,
        "risk_label": risk_label,
        "explanation": {
            "plain_text": base_reason,
            "primary_factors": factors
        },
        "disruption_probability": disruption_prob
    }

def activate_policy(worker: Worker, tier: str) -> Policy:
    recommendations = get_policy_recommendations(worker)
    selected_plan = next((p for p in recommendations["plans"] if p["tier"] == tier), recommendations["plans"][1]) # Default to Standard
    
    policy_id = f"POL-{uuid.uuid4().hex[:8].upper()}"
    valid_from = datetime.utcnow()
    valid_until = valid_from + timedelta(days=7)
    
    # Contract Snapshots
    income_val = INCOME_BAND_TO_VALUE.get(worker.income_band, 4000)
    hours_val = worker.working_hours_per_day * worker.days_worked_per_week
    
    policy = Policy(
        policy_id=policy_id,
        worker_id=worker.worker_id,
        tier=selected_plan["tier"],
        premium_amount=selected_plan["premium_amount"],
        hourly_benefit=selected_plan["hourly_benefit"],
        weekly_cap=selected_plan["weekly_cap"],
        remaining_cap=selected_plan["weekly_cap"], # Initially full
        replacement_fraction=selected_plan["replacement_fraction"],
        expected_weekly_loss=selected_plan["expected_weekly_loss"],
        covered_triggers=selected_plan["covered_triggers"],
        recommendation_explanation=selected_plan["explanation"],
        income_estimate_snapshot=income_val,
        working_hours_snapshot=hours_val,
        valid_from=valid_from,
        valid_until=valid_until
    )
    
    with db.db_lock:
        db.policies[policy_id] = policy
        
    return policy

def get_active_policy(worker_id: str) -> Optional[Policy]:
    with db.db_lock:
        return next((p for p in db.policies.values() if p.worker_id == worker_id and p.status == "ACTIVE"), None)
