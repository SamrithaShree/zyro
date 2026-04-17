import os
import subprocess
import sys

def run_script(script_name):
    print(f"\n--- Running {script_name} ---")
    result = subprocess.run([sys.executable, script_name], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"FAILED: {script_name}")
        print("Error Output:")
        print(result.stderr)
        return False
    else:
        print(result.stdout)
        print(f"SUCCESS: {script_name}")
        return True

def validate_artifacts():
    print("\n--- Validating Expected Artifacts ---")
    model_dir = "app/services/ml/models"
    
    expected_artifacts = [
        "premium_xgboost.pkl",
        "premium_features.json",
        "iforest_enhanced.pkl",
        "fraud_scaler.pkl",
        "fraud_thresholds.json",
        "activity_lstm.h5"
    ]
    
    all_exist = True
    for artifact in expected_artifacts:
        path = os.path.join(model_dir, artifact)
        if os.path.exists(path):
            print(f" [PASS] Found {artifact}")
        else:
            print(f" [FAIL] Missing {artifact}")
            all_exist = False
            
    return all_exist

def main():
    print("=========================================")
    print(" STARTING COMPLETE ML TRAINING PIPELINE ")
    print("=========================================")
    
    scripts = [
        "generate_premium_training_data.py",
        "train_premium_model.py",
        "generate_fraud_training_data.py",
        "train_fraud_model.py",
        "generate_activity_training_data.py",
        "train_activity_model.py"
    ]
    
    for script in scripts:
        if not run_script(script):
            print("\nPipeline aborted due to script failure.")
            sys.exit(1)
            
    if validate_artifacts():
        print("\n=========================================")
        print(" PIPELINE COMPLETE: ALL MODELS TRAINED OK")
        print("=========================================")
    else:
        print("\n=========================================")
        print(" PIPELINE COMPLETE BUT ARTIFACTS MISSING")
        print("=========================================")
        sys.exit(1)

if __name__ == "__main__":
    main()
