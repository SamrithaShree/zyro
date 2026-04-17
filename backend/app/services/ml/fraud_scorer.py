"""
services/ml/fraud_scorer.py — Canonical fraud scoring interface.

Spec requirement:
    from app.services.ml.fraud_scorer import compute_fraud_score

This module implements Behavior-based anomaly detection using Isolation Forest
with sigmoid normalization for scoring.
"""

import os
import json
import logging
import joblib
import numpy as np
from typing import Dict, Tuple, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.domain import Worker, Event

logger = logging.getLogger(__name__)

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
            logger.error(f"Error loading Fraud ML artifacts: {e}")

def compute_fraud_score_raw(claim_signals: dict) -> tuple[float, str, dict]:
    """
    Internal high-fidelity detection using Isolation Forest.
    Returns (anomaly_score_0_to_1, confidence_lane, metadata)
    """
    _load_artifacts()
    metadata = {}
    
    if _model is None or _scaler is None or _thresholds is None:
        return 1.0, "REVIEW", {"error": "Model not loaded"}
        
    features = [
        'gps_motion_correlation',
        'session_continuity',
        'zone_visit_freq'
    ]
    
    try:
        x_input = [float(claim_signals.get(feat, 0.0)) for feat in features]
        X_arr = np.array([x_input])
        X_scaled = _scaler.transform(X_arr)
        
        # Raw anomaly score (lower is more abnormal)
        raw_score = float(_model.decision_function(X_scaled)[0])
        
        # Convert to Anomaly Score [0, 1] using sigmoid
        sig_input = -1.0 * raw_score * 5.0
        anomaly_score = 1.0 / (1.0 + np.exp(-sig_input))
        
        # Apply strict lane routing per spec thresholds
        lane = "REVIEW"
        if anomaly_score < _thresholds.get("HIGH_MAX", 0.3):
            lane = "HIGH"
        elif anomaly_score <= _thresholds.get("MEDIUM_MAX", 0.7):
            lane = "MEDIUM"
            
        metadata["raw_decision_score"] = raw_score
        metadata["scaled_features"] = x_input
        
        return float(anomaly_score), lane, metadata
        
    except Exception as e:
        logger.warning(f"Internal fraud score error: {e}")
        return 1.0, "REVIEW", {"error": str(e)}

def compute_fraud_score(worker: "Worker", event: "Event") -> float:
    """
    Standard interface for ClaimGenerator.
    Extracts signals from Domain Models and returns normalized anomaly score.
    """
    try:
        # Proxy signal generation (Behavioral Proxies)
        signals = {
            'gps_motion_correlation': min(worker.trust_score / 100.0, 1.0),
            'session_continuity': min(worker.working_hours_per_day / 12.0, 1.0),
            'zone_visit_freq': float(worker.days_worked_per_week)
        }
        
        anomaly_score, _, _ = compute_fraud_score_raw(signals)
        return anomaly_score

    except Exception as exc:
        logger.warning("compute_fraud_score fallback: %s", exc)
        return 0.25
