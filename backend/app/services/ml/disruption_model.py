from typing import List
from app.services.ml.risk_model import ZONE_RISK_MAPPING

TRIGGER_IMPACT = {
    "HEAVY_RAIN": 1.4,
    "TRAFFIC_DISRUPTION": 1.25,
    "SEVERE_AQI": 1.15,
    "EXTREME_HEAT": 1.1,
    "PLATFORM_DOWNTIME": 1.5
}

def predict_disruption_probability(zone: str, trigger_types: List[str]) -> float:
    """
    Predicts the probability of disruption in a given zone for specific triggers.
    Clamped between 0.05 and 0.6 for realism.
    """
    # 1. Base Probability from Zone history
    # Convert zone risk (0.0 - 1.0) to a base probability range (0.05 - 0.3)
    base_zone_risk = ZONE_RISK_MAPPING.get(zone, 0.4)
    base_prob = 0.05 + (base_zone_risk * 0.25)
    
    # 2. Add impact of trigger types
    multiplier = 1.0
    for trigger in trigger_types:
        multiplier *= TRIGGER_IMPACT.get(trigger, 1.0)
        
    final_prob = base_prob * multiplier
    
    # 3. Final Clamping
    final_prob = min(max(final_prob, 0.05), 0.6)
    
    return round(final_prob, 2)

import os
import joblib
import numpy as np
import scipy.stats as stats

# Load Gaussian Process model
try:
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "gp_model.pkl")
    gp_model = joblib.load(MODEL_PATH)
except Exception as e:
    gp_model = None
    print(f"Warning: Could not load gp_model.pkl: {e}")

def compute_trigger_confidence(observed_value: float, threshold: float) -> float:
    """
    Computes the confidence that a trigger event has occurred, taking into 
    account uncertainty in the measurement using a Gaussian Process Regressor.
    """
    if gp_model:
        # We assume observed_value maps to some historical index for GP inference
        # In a real pipeline, we'd pass spatial/temporal features. Here we mock X.
        X_infer = np.array([[observed_value]])
        
        # Predict y and its standard deviation (uncertainty)
        y_pred, y_std = gp_model.predict(X_infer, return_std=True)
        
        # Calculate the probability that the actual value exceeds the threshold
        # using the CDF of the normal distribution N(y_pred, y_std)
        prob_exceeds = 1.0 - stats.norm.cdf((threshold - y_pred[0]) / (y_std[0] + 1e-6))
        
        return round(float(prob_exceeds), 2)
    else:
        # Fallback to binary thresholding
        if observed_value >= threshold:
            return 0.95
        return 0.05
