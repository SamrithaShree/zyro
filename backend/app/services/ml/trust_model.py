import redis
import json
from datetime import datetime
from pydantic import BaseModel

# Initialize Redis client (default local config)
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping() # Test connection
except Exception as e:
    redis_client = None
    print(f"Warning: Redis not available ({e})")

class WorkerMock:
    def __init__(self, id, created_at, working_hours_per_day):
        self.id = id
        self.created_at = created_at
        self.working_hours_per_day = working_hours_per_day

def get_bayesian_state(worker_id: str) -> dict:
    """Fetch the Bayesian Beta-Binomial state from Redis, or initialize it."""
    state_key = f"trust_state:{worker_id}"
    if redis_client and redis_client.exists(state_key):
        state = json.loads(redis_client.get(state_key))
        return state
    
    # Initialization Prior: α=2 (successes), β=1 (failures)
    initial_state = {"alpha": 2.0, "beta": 1.0}
    if redis_client:
        redis_client.set(state_key, json.dumps(initial_state))
    return initial_state

def update_bayesian_trust(worker_id: str, claim_outcome: str) -> float:
    """
    Update on each claim outcome:
      - 'approved': α += 1.5
      - 'flagged': α += 0.5, β += 0.5
      - 'fraud_detected': β += 2.0
    """
    state_key = f"trust_state:{worker_id}"
    state = get_bayesian_state(worker_id)
    
    if claim_outcome == 'approved':
        state['alpha'] += 1.5
    elif claim_outcome == 'flagged':
        state['alpha'] += 0.5
        state['beta'] += 0.5
    elif claim_outcome == 'fraud_detected':
        state['beta'] += 2.0
        
    if redis_client:
        redis_client.set(state_key, json.dumps(state))
        
    trust_score = 100 * (state['alpha'] / (state['alpha'] + state['beta']))
    return min(max(trust_score, 0), 100)

def compute_trust_multiplier(worker_id: str, account_age_days: int) -> float:
    """
    Computes a trust multiplier based on Bayesian worker consistency and history.
    Range: 0.8 to 1.2
    """
    state = get_bayesian_state(worker_id)
    trust_score = 100 * (state['alpha'] / (state['alpha'] + state['beta']))
    
    # 1. Base Multiplier from Trust Score
    base = trust_score / 100.0 # e.g. 0.85
    
    # 2. Adjust based on account age
    age_bonus = min(account_age_days / 30.0, 1.0) * 0.1 # Max +0.1 after 30 days
        
    final_multiplier = base + age_bonus
    
    # Clamping
    final_multiplier = min(max(final_multiplier, 0.85), 1.2)
    return round(final_multiplier, 2)
