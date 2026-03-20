import threading
from fastapi.testclient import TestClient
from app.main import app
from app.db.in_memory_db import claims_db, worker_event_map

client = TestClient(app)

def setup_function():
    """Clear DB before each test to ensure isolation."""
    claims_db.clear()
    worker_event_map.clear()

def test_valid_claim_creation():
    payload = {
        "worker_id": "W-001",
        "event_id": "EVT-001",
        "final_status": "ELIGIBLE",
        "effective_loss_ratio": 0.6,
        "severity_multiplier": 0.8
    }
    response = client.post("/claims/create", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "CLM-" in data["claim_id"]
    assert len(claims_db) == 1
    assert len(worker_event_map) == 1

def test_duplicate_requests_idempotency():
    payload = {
        "worker_id": "W-002",
        "event_id": "EVT-002",
        "final_status": "ELIGIBLE",
        "effective_loss_ratio": 0.5,
        "severity_multiplier": 1.0
    }
    
    # Request 1
    res1 = client.post("/claims/create", json=payload)
    claim_id_1 = res1.json()["claim_id"]

    # Request 2 (Duplicate)
    res2 = client.post("/claims/create", json=payload)
    data2 = res2.json()

    # Assert correct response returned
    assert data2["status"] == "SUCCESS"
    assert data2["claim_id"] == claim_id_1
    assert data2["message"] == "Existing claim returned"
    
    # Assert DB maintains strict isolation/prevented drift
    assert len(claims_db) == 1
    assert len(worker_event_map) == 1

def test_ineligible_worker_rejected():
    payload = {
        "worker_id": "W-003",
        "event_id": "EVT-003",
        "final_status": "REJECTED",
        "effective_loss_ratio": 0.6,
        "severity_multiplier": 0.8
    }
    response = client.post("/claims/create", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "REJECTED"
    assert data["claim_id"] is None
    assert len(claims_db) == 0

def test_missing_fields_validation():
    payload = {
        "worker_id": "W-004",
        "event_id": "EVT-004",
        # missing final_status
        "effective_loss_ratio": 0.6,
        "severity_multiplier": 0.8
    }
    response = client.post("/claims/create", json=payload)
    assert response.status_code == 422
    assert response.json()["status"] == "ERROR"
    assert len(claims_db) == 0

def test_race_condition_idempotency():
    """Simulates 5 exact same concurrent requests striking the endpoint to ensure thread-handling prevents creation overlaps."""
    payload = {
        "worker_id": "W-005",
        "event_id": "EVT-005",
        "final_status": "ELIGIBLE",
        "effective_loss_ratio": 0.6,
        "severity_multiplier": 0.8
    }
    
    results = []
    
    def fire_request():
        res = client.post("/claims/create", json=payload)
        results.append(res.json())

    threads = [threading.Thread(target=fire_request) for _ in range(5)]
    for t in threads: t.start()
    for t in threads: t.join()

    # Verify only 1 DB state mapping existed
    assert len(claims_db) == 1
    
    # Verify all responses read SUCCESS without failures
    for r in results:
        assert r["status"] == "SUCCESS"
    
    # Verify exact same Claim ID mapped identically across all 5 threads returning
    claim_ids = {r["claim_id"] for r in results}
    assert len(claim_ids) == 1
