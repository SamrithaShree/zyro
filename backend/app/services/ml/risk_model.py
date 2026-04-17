import os
import joblib
import numpy as np
import shap
from typing import Dict, Tuple

# Load the trained model dynamically
try:
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "premium_model.pkl")
    premium_model = joblib.load(MODEL_PATH)
except Exception as e:
    premium_model = None
    print(f"Warning: Could not load premium_model.pkl: {e}")

ZONE_RISK_MAPPING = {
    "Anna Nagar": 0.45,
    "T Nagar": 0.65,
    "Adyar": 0.35,
    "Velachery": 0.75,
    "Mylapore": 0.40,
    "Guindy": 0.55,
    "Tambaram": 0.80,
    "OMR": 0.50
}

def compute_risk_score(worker_profile: dict, zone: str) -> Tuple[float, str, str]:
    """
    Computes a risk score and expected payout using an ML model.
    """
    zone_risk = ZONE_RISK_MAPPING.get(zone, 0.5)
    hours = int(worker_profile.get("working_hours_per_day", 8))
    
    income_band_val = 3
    income_band_str = worker_profile.get("income_band") or "₹15k - ₹25k"
    if "15k" in income_band_str: income_band_val = 2
    elif "25k" in income_band_str: income_band_val = 3
    elif "35k" in income_band_str: income_band_val = 4
    elif "45k" in income_band_str: income_band_val = 5

    if premium_model:
        # Create feature vector matching training schema: [zone_risk, income_band_val, hours]
        features = np.array([[zone_risk, income_band_val, hours]])
        
        # Inference
        expected_payout = premium_model.predict(features)[0]
        
        # SHAP explainability (fast TreeExplainer for boosting model)
        explainer = shap.TreeExplainer(premium_model)
        shap_values = explainer.shap_values(features)[0]
        
        # Determine highest driving feature
        feature_names = ["Zone Risk Patterns", "Income Band Group", "Working Hours Exposure"]
        key_feature_idx = np.argmax(np.abs(shap_values))
        key_feature = feature_names[key_feature_idx]
        
        # Normalize score bounds for system compatibility (0.0 - 1.0)
        # Expected payout bounded mapping (roughly 20-150 relative space)
        final_score = np.clip((expected_payout - 20) / 100.0, 0.0, 1.0)
        
        if final_score < 0.35:
            label = "LOW"
            base_reason = "Your risk profile is low."
        elif final_score < 0.65:
            label = "MEDIUM"
            base_reason = "Moderate exposure detected."
        else:
            label = "HIGH"
            base_reason = "High risk detected."

        factors = []
        for idx, name in enumerate(feature_names):
            factors.append({
                "feature": name,
                "shap_value": float(shap_values[idx]),
                "interpretation": f"{'+' if shap_values[idx] > 0 else ''}{'Increases' if shap_values[idx] > 0 else 'Decreases'} risk by {abs(shap_values[idx]):.2f}"
            })

        return round(final_score, 2), label, base_reason, factors
    else:
        # Fallback if model not found
        final_score = zone_risk
        return final_score, "UNKNOWN", "Fallback rule applied.", []
