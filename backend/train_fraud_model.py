import os
import json
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

MODEL_DIR = "app/services/ml/models"
os.makedirs(MODEL_DIR, exist_ok=True)

def train_fraud_model():
    print("Training Fraud Detection Model (Isolation Forest)...")
    if not os.path.exists("fraud_data.csv"):
        print("Error: fraud_data.csv not found. Run generate_fraud_training_data.py first.")
        return False
        
    df = pd.DataFrame(pd.read_csv("fraud_data.csv"))
    
    features = [
        'gps_motion_correlation',
        'session_continuity',
        'zone_visit_freq'
    ]
    
    X = df[features]
    
    # Strictly require StandardScaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    model = IsolationForest(
        contamination=0.05, 
        random_state=42
    )
    
    model.fit(X_scaled)
    
    # Thresholds exact definition
    thresholds = {
        "HIGH_MAX": 0.3,    # < 0.3
        "MEDIUM_MAX": 0.7   # 0.3 - 0.7, > 0.7 is REVIEW
    }
    
    # Save artifacts
    model_path = os.path.join(MODEL_DIR, "iforest_enhanced.pkl")
    scaler_path = os.path.join(MODEL_DIR, "fraud_scaler.pkl")
    thresholds_path = os.path.join(MODEL_DIR, "fraud_thresholds.json")
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    with open(thresholds_path, "w") as f:
        json.dump(thresholds, f)
        
    print(f" -> Saved {model_path}")
    print(f" -> Saved {scaler_path}")
    print(f" -> Saved {thresholds_path}")
    return True

if __name__ == "__main__":
    train_fraud_model()
