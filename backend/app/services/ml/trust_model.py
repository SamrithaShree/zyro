from datetime import datetime
from app.models.domain import Worker, Event

def compute_trust_multiplier(worker: Worker, event: Event) -> float:
    """
    Computes a trust multiplier based on worker consistency and history.
    Range: 0.8 to 1.2
    """
    # 1. Base Multiplier from Trust Score
    base = worker.trust_score / 100.0 # e.g. 0.85
    
    # 2. Adjust based on account age (policy age simulation)
    # Using worker creation time as a proxy
    account_age_days = (datetime.utcnow() - worker.created_at).days
    age_bonus = min(account_age_days / 30.0, 1.0) * 0.1 # Max +0.1 after 30 days
    
    # 3. Working Consistency (mock logic)
    # Higher hours per day indicates more commitment/consistency
    consistency_bonus = 0.0
    if worker.working_hours_per_day >= 10:
        consistency_bonus = 0.1
    elif worker.working_hours_per_day >= 8:
        consistency_bonus = 0.05
        
    final_multiplier = base + age_bonus + consistency_bonus
    
    # 4. Clamping
    final_multiplier = min(max(final_multiplier, 0.85), 1.2)
    
    return round(final_multiplier, 2)
