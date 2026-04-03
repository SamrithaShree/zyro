import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from app.db import session as db
from app.models.domain import Worker, Policy
from app.core.pricing_logic import calculate_weekly_premium

def register_worker(phone: str, platform: str, zone: str, income_band: str) -> Worker:
    worker_id = f"W-{uuid.uuid4().hex[:8].upper()}"
    
    with db.db_lock:
        if phone in db.phone_to_worker_id:
            # Re-fetch existing if already registered (idempotency)
            return db.workers[db.phone_to_worker_id[phone]]
            
        worker = Worker(
            worker_id=worker_id,
            phone=phone,
            platform=platform,
            zone=zone,
            income_band=income_band
        )
        db.workers[worker_id] = worker
        db.phone_to_worker_id[phone] = worker_id
        
    return worker

def get_worker_by_id(worker_id: str) -> Optional[Worker]:
    with db.db_lock:
        return db.workers.get(worker_id)

def get_policy_quote(zone: str, income_band: str) -> dict:
    return calculate_weekly_premium(zone, income_band)

def activate_policy(worker_id: str, zone: str, income_band: str) -> Policy:
    quote = calculate_weekly_premium(zone, income_band)
    policy_id = f"POL-{uuid.uuid4().hex[:8].upper()}"
    valid_until = datetime.utcnow() + timedelta(days=7)
    
    policy = Policy(
        policy_id=policy_id,
        worker_id=worker_id,
        premium_amount=quote["premium_amount"],
        hourly_benefit=quote["hourly_benefit"],
        weekly_cap=quote["weekly_cap"],
        valid_until=valid_until
    )
    
    with db.db_lock:
        db.policies[policy_id] = policy
        
    return policy
