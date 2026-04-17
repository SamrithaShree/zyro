import os
import joblib
import numpy as np

# Load the trained Isolation Forest model dynamically
try:
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "iforest_scorer.pkl")
    iforest_model = joblib.load(MODEL_PATH)
except Exception as e:
    iforest_model = None
    print(f"Warning: Could not load iforest_scorer.pkl: {e}")

def compute_anomaly_score(gps_motion_corr: float, session_continuity: float, zone_visit_freq: int) -> float:
    """
    Computes an anomaly score using Isolation Forest for WIVE routing.
    Output: anomaly_score [0, 1] where 0=normal, 1=anomaly.
    """
    if iforest_model:
        # Expected features: gps_motion_correlation, session_continuity, zone_visit_freq
        features = np.array([[gps_motion_corr, session_continuity, float(zone_visit_freq)]])
        
        # decision_function returns negative values for anomalies, positive for normal
        # Standardize score into [0, 1] mapped roughly around 0.0
        raw_score = iforest_model.decision_function(features)[0]
        
        # If normal (raw_score > 0), anomaly is low (0-0.4)
        # If anomalous (raw_score < 0), anomaly is high (0.6-1.0)
        anomaly_score = 1.0 - (1.0 / (1.0 + np.exp(-raw_score * 5)))  # Sigmoid-like scaling
        return float(np.clip(anomaly_score, 0.0, 1.0))
    else:
        # Fallback to rule logic if ML fails
        if gps_motion_corr < 0.5 or session_continuity < 0.5:
            return 0.8
        return 0.1

def determine_confidence_tier(anomaly_score: float) -> str:
    """
    Routes the request based on the anomaly score.
    """
    if anomaly_score > 0.75:
        return "REVIEW" # Suspicious
    elif anomaly_score > 0.40:
        return "MEDIUM" # Deferred
    else:
        return "HIGH" # Fast-track
