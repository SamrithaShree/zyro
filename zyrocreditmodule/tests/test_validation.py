from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == "ZyroCredit running"

def test_valid_input():
    payload = {
        "worker_id": "W-001",
        "event_id": "EVT-001",
        "final_status": "ELIGIBLE",
        "effective_loss_ratio": 0.6,
        "severity_multiplier": 0.8
    }
    response = client.post("/test-input", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "SUCCESS"

def test_missing_keys():
    payload = {
        "worker_id": "W-001",
        # missing event_id
        "final_status": "ELIGIBLE",
        "effective_loss_ratio": 0.6,
        "severity_multiplier": 0.8
    }
    response = client.post("/test-input", json=payload)
    assert response.status_code == 422
    assert response.json()["status"] == "ERROR"
    assert response.json()["message"] == "Invalid input"

def test_invalid_data_types():
    payload = {
        "worker_id": "W-001",
        "event_id": "EVT-001",
        "final_status": "ELIGIBLE",
        "effective_loss_ratio": "NOT_A_FLOAT",
        "severity_multiplier": 0.8
    }
    response = client.post("/test-input", json=payload)
    assert response.status_code == 422
    assert response.json()["status"] == "ERROR"

def test_unexpected_fields():
    payload = {
        "worker_id": "W-001",
        "event_id": "EVT-001",
        "final_status": "ELIGIBLE",
        "effective_loss_ratio": 0.6,
        "severity_multiplier": 0.8,
        "something_else": "ignored"
    }
    response = client.post("/test-input", json=payload)
    assert response.status_code == 200
    assert "something_else" not in response.json()["data"]

def test_empty_input():
    response = client.post("/test-input", json={})
    assert response.status_code == 422
    assert response.json()["status"] == "ERROR"
