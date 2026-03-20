import threading
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.db.in_memory_db import claims_db, payments_db, worker_event_map, claim_transaction_map, db_lock

client = TestClient(app)

def setup_function():
    with db_lock:
        claims_db.clear()
        payments_db.clear()
        worker_event_map.clear()
        claim_transaction_map.clear()

def seed_calculated_claim(claim_id, worker_id, amount=120):
    payload = {
        "claim_id": claim_id,
        "worker_id": worker_id,
        "event_id": f"EVT-{claim_id}",
        "status": "APPROVED",
        "effective_loss_ratio": 0.5,
        "severity_multiplier": 0.8,
        "created_at": "2026-03-20T00:00:00Z",
        "payout_amount": amount,
        "payout_status": "CALCULATED"
    }
    claims_db[claim_id] = payload
    worker_event_map[(worker_id, f"EVT-{claim_id}")] = claim_id

@patch("app.services.base_service.random.choice")
def test_successful_payment(mock_choice):
    # Simulates choosing True right on the first execution chance
    mock_choice.return_value = True
    
    seed_calculated_claim("CLM-100", "W-100", 120)
    res = client.post("/payments/execute", json={"claim_id": "CLM-100"})
    
    assert res.status_code == 200
    assert res.json()["status"] == "SUCCESS"
    assert res.json()["amount"] == 120
    assert "TXN-" in res.json()["transaction_id"]
    
    # Verification DB tracking states correctly mutated natively
    assert claims_db["CLM-100"]["payment_status"] == "PAID"
    txn_id = res.json()["transaction_id"]
    assert payments_db[txn_id]["status"] == "SUCCESS"

@patch("app.services.base_service.random.choice")
def test_successful_payment_after_retries(mock_choice):
    # Simulates latency failures resolving safely before loop bounds (Fail, Fail, Success)
    mock_choice.side_effect = [False, False, True]
    
    seed_calculated_claim("CLM-101", "W-101", 150)
    res = client.post("/payments/execute", json={"claim_id": "CLM-101"})
    
    assert res.status_code == 200
    assert res.json()["status"] == "SUCCESS"
    txn_id = res.json()["transaction_id"]
    assert payments_db[txn_id]["status"] == "SUCCESS"
    assert mock_choice.call_count == 3 # Ascertains exact simulated loop latency executed

@patch("app.services.base_service.random.choice")
def test_exhausted_retries_failure(mock_choice):
    # All explicit attempts fail dropping logically through bounds loops
    mock_choice.side_effect = [False, False, False]
    
    seed_calculated_claim("CLM-102", "W-102", 200)
    res = client.post("/payments/execute", json={"claim_id": "CLM-102"})
    
    assert res.status_code == 200
    assert res.json()["status"] == "FAILED"
    assert res.json()["message"] == "Retries exhausted"
    
    # Assert DB tracks failures preserving evidence
    txn_id = claim_transaction_map["CLM-102"]
    assert payments_db[txn_id]["status"] == "FAILED"
    # Claim avoids incorrect modification explicitly mappings preventing overrides mapping structurally natively
    assert "payment_status" not in claims_db["CLM-102"]

@patch("app.services.base_service.random.choice")
def test_idempotent_duplicate_requests(mock_choice):
    # Immediate successes globally overriding logic executing manually ensuring double validations fail safely returning original state natively 
    mock_choice.return_value = True
    seed_calculated_claim("CLM-103", "W-103", 100)
    
    res1 = client.post("/payments/execute", json={"claim_id": "CLM-103"})
    txn_1 = res1.json()["transaction_id"]
    
    # Submit explicit identically mapped identical requests duplicating explicitly natively
    res2 = client.post("/payments/execute", json={"claim_id": "CLM-103"})
    
    assert res2.json()["status"] == "SUCCESS"
    assert res2.json()["transaction_id"] == txn_1
    assert res2.json()["message"] == "Already processed"
    
    # Verification explicitly guarantees internal definitions preserved mapping single transaction explicitly only maps natively safely implicitly natively ensuring
    assert len(payments_db) == 1

def test_invalid_claim_state():
    # Attempt bypassing calculations limits directly rejecting bounds inherently mapping logic mappings natively defining.
    seed_calculated_claim("CLM-104", "W-104", 100)
    claims_db["CLM-104"]["payout_status"] = "FAILED"
    res = client.post("/payments/execute", json={"claim_id": "CLM-104"})
    assert res.json()["status"] == "ERROR"

    # Avoid zero amount validations 
    seed_calculated_claim("CLM-105", "W-105", 0)
    res = client.post("/payments/execute", json={"claim_id": "CLM-105"})
    assert res.json()["status"] == "ERROR"
