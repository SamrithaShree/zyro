import sys
sys.path.append('.') # Add backend/ to path so imports work

print("=== ZYRO ML INFERENCE TESTS ===")

print("\n1. Testing Risk Model (Gradient Boosting / SHAP)...")
from app.services.ml.risk_model import compute_risk_score
score, label, reasoning = compute_risk_score({"working_hours_per_day": 10, "income_band": "₹25k - ₹35k"}, "Adyar")
print(f"Outcome -> Score: {score}, Label: {label}, Reasoning: {reasoning}")

print("\n2. Testing Fraud Model (Isolation Forest)...")
from app.services.ml.fraud_model import compute_anomaly_score, determine_confidence_tier
a_score = compute_anomaly_score(0.9, 0.9, 50)
a_tier = determine_confidence_tier(a_score)
print(f"Normal Feature -> Anomaly: {a_score}, Route: {a_tier}")
b_score = compute_anomaly_score(0.2, 0.1, 1)
b_tier = determine_confidence_tier(b_score)
print(f"Suspicious Feature -> Anomaly: {b_score}, Route: {b_tier}")

print("\n3. Testing Trust Model (Bayesian Redis)...")
from app.services.ml.trust_model import update_bayesian_trust, compute_trust_multiplier
# Simulate a worker claim flag
print(f"Prior update...")
trust_a = update_bayesian_trust("worker_001", "flagged")
print(f"Trust after 1 flag: {trust_a}")
trust_b = compute_trust_multiplier("worker_001", 15)
print(f"Multiplier for worker: {trust_b}")

print("\n4. Testing Disruption Model (Gaussian Process)...")
from app.services.ml.disruption_model import compute_trigger_confidence
conf = compute_trigger_confidence(2.5, 2.0)
print(f"Trigger Confidence (observed=2.5, threshold=2.0) = {conf}")

print("\n5. Testing Activity Model (LSTM)...")
from app.services.ml.activity_model import classify_activity_state, get_demo_dummy_payload
payload = get_demo_dummy_payload("active")
state = classify_activity_state(payload)
print(f"Predicted LSTM state for dummy payload: {state}")

print("\n=== ALL TESTS COMPLETED ===")
