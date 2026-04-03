from fastapi.testclient import TestClient
from app.main import app
from app.db.in_memory_db import claims_db, worker_event_map, db_lock

client = TestClient(app)

def setup_function():
    """Clear dictionaries fully prior to individual executions"""
    with db_lock:
        claims_db.clear()
        worker_event_map.clear()
        
def seed_claim(claim_id, worker_id, event_id, status="APPROVED", loss_ratio=0.5, severity=0.8):
    payload = {
        "claim_id": claim_id,
        "worker_id": worker_id,
        "event_id": event_id,
        "status": status,
        "effective_loss_ratio": loss_ratio,
        "severity_multiplier": severity,
        "created_at": "2026-03-20T00:00:00Z"
    }
    claims_db[claim_id] = payload
    worker_event_map[(worker_id, event_id)] = claim_id


def test_valid_payout_calculation():
    # Case 1 exactly from prompt
    # EVT-001 (duration 2.0) | W-001 (benefit 150) -> 150 * 2.0 * 0.8 * 0.5 = 120
    seed_claim("CLM-001", "W-001", "EVT-001", loss_ratio=0.5, severity=0.8)
    res = client.post("/payouts/calculate", json={"claim_id": "CLM-001"})
    assert res.status_code == 200
    assert res.json()["status"] == "SUCCESS"
    assert res.json()["payout"] == 120
    
    # Check claim modifications persisted correctly via dict updates
    claim = claims_db["CLM-001"]
    assert claim["payout_amount"] == 120
    assert claim["payout_status"] == "CALCULATED"

def test_low_payout_rejection():
    # Below MIN_PAYOUT threshold bounds evaluations
    # W-002: 100 benefit, EVT-002: 0.2 hrs = 100 * 0.2 * 1.0 * 1.0 = 20 (Below 50 threshold rule)
    seed_claim("CLM-002", "W-002", "EVT-002", loss_ratio=1.0, severity=1.0)
    res = client.post("/payouts/calculate", json={"claim_id": "CLM-002"})
    assert res.status_code == 200
    assert res.json()["status"] == "NO_PAYOUT"

def test_duplicate_payout_idempotency_check():
    # Multiple overlapping checks evaluates IDEMPOTENCY
    seed_claim("CLM-003", "W-003", "EVT-003", loss_ratio=0.5, severity=0.8)
    
    res1 = client.post("/payouts/calculate", json={"claim_id": "CLM-003"})
    assert res1.json()["payout"] == 800 # 200 benefit * 10 hrs * 0.8 * 0.5 = 800
    assert res1.json()["status"] == "SUCCESS"
    
    # Rerequest explicitly
    res2 = client.post("/payouts/calculate", json={"claim_id": "CLM-003"})
    assert res2.json()["payout"] == 800
    assert res2.json()["status"] == "SUCCESS"

def test_zero_duration_rejection():
    # 0 multipliers evaluates errors mapped properly 
    seed_claim("CLM-004", "W-004", "EVT-004", loss_ratio=1.0, severity=1.0)
    res = client.post("/payouts/calculate", json={"claim_id": "CLM-004"})
    assert res.json()["status"] == "ERROR"

def test_payout_upper_bound_cap_limit():
    # Verifies internal boundary caps (durations over 24 clipped)
    # W-MAX = 500, EVT-MAX = 30.0 hrs -> 30 capped to 24 * 500 = 12000 not 15000
    seed_claim("CLM-MAX", "W-MAX", "EVT-MAX", loss_ratio=1.0, severity=1.0)
    res = client.post("/payouts/calculate", json={"claim_id": "CLM-MAX"})
    assert res.json()["status"] == "SUCCESS"
    assert res.json()["payout"] == 12000

def test_invalid_state_rejection_hooks():
    # Explicitly prevents evaluating un-APPROVED values
    seed_claim("CLM-REJ", "W-001", "EVT-001", status="REJECTED")
    res = client.post("/payouts/calculate", json={"claim_id": "CLM-REJ"})
    assert res.json()["status"] == "ERROR"
