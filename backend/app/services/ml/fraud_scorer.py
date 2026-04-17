import os
import json
import joblib
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "iforest_enhanced.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "fraud_scaler.pkl")
THRESHOLDS_PATH = os.path.join(MODEL_DIR, "fraud_thresholds.json")

_model = None
_scaler = None
_thresholds = None

def _load_artifacts():
    global _model, _scaler, _thresholds
    if _model is None:
        try:
            _model = joblib.load(MODEL_PATH)
            _scaler = joblib.load(SCALER_PATH)
            with open(THRESHOLDS_PATH, "r") as f:
                _thresholds = json.load(f)
        except Exception as e:
            print(f"Error loading Fraud ML artifacts: {e}")

def compute_fraud_score(claim_signals: dict) -> tuple[float, str, dict]:
    """
    Detects anomalies using Isolation Forest.
    Returns (anomaly_score_0_to_1, confidence_lane, metadata)
    """
    _load_artifacts()
    
    metadata = {}
    
    if _model is None or _scaler is None or _thresholds is None:
        # Failsafe logic that aligns with API structure, returning 1.0 (requires REVIEW)
        return 1.0, "REVIEW", {"error": "Model not loaded"}
        
    features = [
        'gps_motion_correlation',
        'session_continuity',
        'zone_visit_freq'
    ]
    
    try:
        x_input = [float(claim_signals.get(feat, 0.0)) for feat in features]
    except (ValueError, TypeError) as e:
        return 1.0, "REVIEW", {"error": f"Invalid input: {str(e)}"}
        
    X_arr = np.array([x_input])
    
    try:
        X_scaled = _scaler.transform(X_arr)
        
        # Raw anomaly score: the lower, the more abnormal. Usually between -0.5 and 0.5.
        raw_score = float(_model.decision_function(X_scaled)[0])
        
        # Convert to Anomaly Score [0, 1] through sigmoid normalization.
        # We want the highest score to represent the highest chance of fraud (anomaly).
        # We invert the score (multiply by -1) before sigmoid.
        # Often a scaling factor e.g. 5.0 is used to make the sigmoid slope reasonable.
        sig_input = -1.0 * raw_score * 5.0
        anomaly_score = 1.0 / (1.0 + np.exp(-sig_input))
        
        # Apply strict lane routing
        lane = "REVIEW"
        if anomaly_score < _thresholds.get("HIGH_MAX", 0.3):
            lane = "HIGH"
        elif anomaly_score <= _thresholds.get("MEDIUM_MAX", 0.7):
            lane = "MEDIUM"
            
        metadata["raw_decision_score"] = raw_score
        metadata["scaled_features"] = x_input
        
        return float(anomaly_score), lane, metadata
        
    except Exception as e:
        return 1.0, "REVIEW", {"error": str(e)}
