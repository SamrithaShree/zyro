import os
import numpy as np
import joblib
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.ensemble import IsolationForest
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

# Setup Output Directory
MODEL_DIR = "app/services/ml/models"
os.makedirs(MODEL_DIR, exist_ok=True)

print("Starting Model Training Pipeline...")

# ----------------- 1. PREMIUM PREDICTION (GRADIENT BOOSTING) -----------------
print("Training Premium Prediction (Gradient Boosting)...")
np.random.seed(42)
n_workers = 5000
# Synthetic features: zone_risk (0-1), income_band_val (1-5), hours (1-12)
X_prem = np.random.rand(n_workers, 3) 
X_prem[:, 1] = np.random.randint(1, 6, n_workers) # income bands
X_prem[:, 2] = np.random.randint(1, 13, n_workers) # working hours

# Target: actual payout realized (synthetic logic)
y_prem = (X_prem[:, 0] * 50) + (100 / X_prem[:, 1]) + (X_prem[:, 2] * 5) + np.random.normal(0, 5, n_workers)

xgb = HistGradientBoostingRegressor(max_iter=100, max_depth=4, learning_rate=0.05, random_state=42)
xgb.fit(X_prem, y_prem)

joblib.dump(xgb, os.path.join(MODEL_DIR, "premium_model.pkl"))
print(" -> Saved premium_model.pkl")


# ----------------- 2. FRAUD ANOMALY SCORER (ISOLATION FOREST) -----------------
print("Training Fraud Anomaly Scorer (Isolation Forest)...")
# Features: gps_motion_correlation (0-1), session_continuity (0-1), zone_visit_freq (1-100)
X_fraud_normal = np.random.normal(loc=[0.9, 0.9, 50], scale=[0.05, 0.05, 10], size=(4000, 3))
X_fraud_anomalous = np.random.normal(loc=[0.4, 0.3, 2], scale=[0.1, 0.1, 1], size=(200, 3))
X_fraud = np.vstack([X_fraud_normal, X_fraud_anomalous])

iforest = IsolationForest(contamination=0.05, random_state=42)
iforest.fit(X_fraud)

joblib.dump(iforest, os.path.join(MODEL_DIR, "iforest_scorer.pkl"))
print(" -> Saved iforest_scorer.pkl")


# ----------------- 3. TRIGGER CONFIDENCE (GAUSSIAN PROCESS) -----------------
print("Training Trigger Confidence (Gaussian Process)...")
# X: historical time or severity index, Y: target observation
X_gp = np.linspace(0.1, 5.0, 100).reshape(-1, 1)
y_gp = np.sin(X_gp).ravel() + np.random.normal(0, 0.1, X_gp.shape[0])

kernel = C(1.0, (1e-3, 1e3)) * RBF(1.0, (1e-2, 1e2))
gp = GaussianProcessRegressor(kernel=kernel, alpha=0.1, n_restarts_optimizer=5, random_state=42)
gp.fit(X_gp, y_gp)

joblib.dump(gp, os.path.join(MODEL_DIR, "gp_model.pkl"))
print(" -> Saved gp_model.pkl")


# ----------------- 4. ACTIVITY STATE CLASSIFIER (LSTM) -----------------
print("Training Activity State Classifier (LSTM)...")
# shape: (samples, time_steps = 60, features = 6) [accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z]
n_samples = 500
X_lstm = np.random.rand(n_samples, 60, 6)
# Classes: 0: active_delivery, 1: waiting, 2: stationary, 3: uncertain
y_lstm = np.random.randint(0, 4, n_samples)

# One-hot encode correctly instead of to_categorical to avoid requiring full keras utils
y_lstm_onehot = np.zeros((n_samples, 4))
y_lstm_onehot[np.arange(n_samples), y_lstm] = 1

model = Sequential([
    LSTM(32, input_shape=(60, 6)),
    Dropout(0.2),
    Dense(4, activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
model.fit(X_lstm, y_lstm_onehot, epochs=2, batch_size=32, verbose=0)

model.save(os.path.join(MODEL_DIR, "activity_lstm.h5"))
print(" -> Saved activity_lstm.h5")

print("All ML models successfully trained and serialized.")
