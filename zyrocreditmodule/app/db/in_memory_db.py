from typing import Optional, Dict, Any, Tuple
import threading

# Primary Storage
claims_db: Dict[str, Any] = {}
payments_db: Dict[str, Any] = {}

# Secondary Indices
worker_event_map: Dict[Tuple[str, str], str] = {}
claim_transaction_map: Dict[str, str] = {} # Stage 4: claim_id -> transaction_id

# Stage 3: Mock External Storage for EGM (Events) and Policy engines
events_db: Dict[str, dict] = {
    "EVT-001": {"duration": 2.0},
    "EVT-002": {"duration": 0.2}, 
    "EVT-003": {"duration": 10.0},
    "EVT-004": {"duration": 0.0},
    "EVT-MAX": {"duration": 30.0}
}
policies_db: Dict[str, dict] = {
    "W-001": {"hourly_benefit": 150},
    "W-002": {"hourly_benefit": 100},
    "W-003": {"hourly_benefit": 200},
    "W-004": {"hourly_benefit": 150},
    "W-MAX": {"hourly_benefit": 500}
}

db_lock = threading.Lock()

def insert_claim(claim_id: str, claim_data: Any):
    claims_db[claim_id] = claim_data

def get_claim(claim_id: str) -> Optional[Any]:
    return claims_db.get(claim_id)

def get_claim_by_worker_event(worker_id: str, event_id: str) -> Optional[str]:
    return worker_event_map.get((worker_id, event_id))

def insert_claim_atomic(worker_id: str, event_id: str, claim_id: str, claim_data: Any) -> bool:
    with db_lock:
        if (worker_id, event_id) in worker_event_map:
            return False
        claims_db[claim_id] = claim_data
        worker_event_map[(worker_id, event_id)] = claim_id
        return True

def update_claim_payout_atomic(claim_id: str, payout_amount: int, payout_status: str) -> bool:
    with db_lock:
        claim = claims_db.get(claim_id)
        if not claim:
            return False
        if claim.get("payout_status") == "CALCULATED":
            return False
        claims_db[claim_id]["payout_amount"] = payout_amount
        claims_db[claim_id]["payout_status"] = payout_status
        return True

# Stage 4: Payment execution atomic operations
def get_transaction_by_claim(claim_id: str) -> Optional[str]:
    return claim_transaction_map.get(claim_id)

def get_payment(transaction_id: str) -> Optional[Any]:
    return payments_db.get(transaction_id)

def insert_transaction_atomic(claim_id: str, transaction_id: str, payment_data: Any) -> bool:
    with db_lock:
        if claim_id in claim_transaction_map:
            return False
        payments_db[transaction_id] = payment_data
        claim_transaction_map[claim_id] = transaction_id
        return True

def finalize_payment_atomic(claim_id: str, transaction_id: str, status: str) -> bool:
    with db_lock:
        claim = claims_db.get(claim_id)
        payment = payments_db.get(transaction_id)
        if not claim or not payment:
            return False
        payments_db[transaction_id]["status"] = status
        if status == "SUCCESS":
            claims_db[claim_id]["payment_status"] = "PAID"
        return True
