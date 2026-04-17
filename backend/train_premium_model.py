import os
import json
import pandas as pd
import joblib
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split

MODEL_DIR = "app/services/ml/models"
os.makedirs(MODEL_DIR, exist_ok=True)

def train_premium_model():
    print("Training Premium Prediction Model (Gradient Boosting)...")
    if not os.path.exists("premium_data.csv"):
        print("Error: premium_data.csv not found. Run generate_premium_training_data.py first.")
        return False
        
    df = pd.DataFrame(pd.read_csv("premium_data.csv"))
    
    features = [
        'zone_risk',
        'income_band_value',
        'working_hours',
        'platform_tenure',
        'days_active_last_week',
        'zone_disruption_count'
    ]
    
    target = 'expected_weekly_loss'
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Using GradientBoostingRegressor to avoid missing libomp on macOS
    model = GradientBoostingRegressor(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.05,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    score = model.score(X_test, y_test)
    print(f" -> Testing R^2 Score: {score:.4f}")
    
    # Save artifacts
    model_path = os.path.join(MODEL_DIR, "premium_xgboost.pkl")
    joblib.dump(model, model_path)
    
    features_path = os.path.join(MODEL_DIR, "premium_features.json")
    with open(features_path, "w") as f:
        json.dump(features, f)
        
    print(f" -> Saved {model_path}")
    print(f" -> Saved {features_path}")
    return True

if __name__ == "__main__":
    train_premium_model()
