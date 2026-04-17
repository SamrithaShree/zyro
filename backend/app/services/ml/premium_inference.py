import os
import json
import joblib
import numpy as np
import shap

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "premium_xgboost.pkl")
FEATURES_PATH = os.path.join(MODEL_DIR, "premium_features.json")

_model = None
_features = None
_explainer = None

def _load_artifacts():
    global _model, _features, _explainer
    if _model is None:
        try:
            _model = joblib.load(MODEL_PATH)
            with open(FEATURES_PATH, "r") as f:
                _features = json.load(f)
            _explainer = shap.TreeExplainer(_model)
        except Exception as e:
            print(f"Error loading Premium ML artifacts: {e}")

def predict_expected_loss(worker_profile: dict) -> tuple[float, dict]:
    """
    Predicts the expected weekly loss for a worker and provides SHAP explanations.
    """
    _load_artifacts()
    
    if _model is None or _features is None:
        return 20.0, {"error": "Model artifacts not loaded."}
        
    try:
        x_input = [float(worker_profile.get(feat, 0.0)) for feat in _features]
    except (ValueError, TypeError) as e:
        return 20.0, {"error": f"Invalid input types: {e}"}
        
    X_arr = np.array([x_input])
    
    pred = float(_model.predict(X_arr)[0])
    pred = max(20.0, min(900.0, pred))
    
    metadata = {}
    try:
        shap_values = _explainer.shap_values(X_arr)[0]
        feature_impacts = sorted(zip(_features, shap_values), key=lambda x: abs(x[1]), reverse=True)
        top_3 = feature_impacts[:3]
        
        metadata["top_contributing_features"] = [
            {"feature": f[0], "impact": float(f[1])} for f in top_3
        ]
    except Exception as e:
        metadata["shap_error"] = str(e)
        metadata["top_contributing_features"] = []
        
    return pred, metadata
