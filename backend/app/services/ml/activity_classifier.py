"""
services/ml/activity_classifier.py — Canonical activity classification interface.

Spec requirement:
    from app.services.ml.activity_classifier import classify_activity, has_earning_intent

This module implements direct LSTM-based classification with a fallback 
mechanism for demo mode.
"""

import os
import logging
import numpy as np
import tensorflow as tf
from typing import List, Optional, Tuple

# We still import get_demo_dummy_payload for demo mode support
from app.services.ml.activity_model import get_demo_dummy_payload

logger = logging.getLogger(__name__)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "activity_lstm.h5")

_model = None

# Exact mapping required by the system
CLASSES = {
    0: "active_delivery",
    1: "waiting_for_order",
    2: "stationary",
    3: "uncertain"
}

# Activity states considered as indicating earning intent
EARNING_INTENT_STATES = {"active_delivery", "waiting_for_order", "waiting"}

def _load_model():
    global _model
    if _model is None:
        try:
            # Silence tensorflow logs
            os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
            _model = tf.keras.models.load_model(MODEL_PATH)
        except Exception as e:
            logger.error(f"Error loading Activity ML artifact: {e}")

def classify_activity(sensor_payload: Optional[List] = None) -> str:
    """
    Canonical interface: Classify worker activity from sensor data.
    
    Args:
        sensor_payload: List of shape (60, 6). If None, enters dummy demo mode.
        
    Returns:
        label: "active_delivery" | "waiting_for_order" | "stationary" | "uncertain"
    """
    _load_model()
    
    # Demo Mode Fallback
    if sensor_payload is None:
        logger.debug("classify_activity: using demo dummy payload")
        sensor_payload = get_demo_dummy_payload(state_type="active")
        
    if _model is None:
        return "uncertain"
        
    try:
        # Convert list to numpy and check shape (60, 6) as required by spec
        sequence = np.array(sensor_payload)
        if sequence.shape != (60, 6):
            logger.warning(f"Rejecting invalid shape. Expected (60, 6), got {sequence.shape}")
            return "uncertain"
            
        # Add batch dimension
        X_arr = np.expand_dims(sequence, axis=0)
        
        preds = _model.predict(X_arr, verbose=0)[0]
        max_idx = int(np.argmax(preds))
        confidence = float(preds[max_idx])
        
        # User explicitly requested fallback if confidence < 0.4
        if confidence < 0.4:
            return "uncertain"
            
        return CLASSES.get(max_idx, "uncertain")
        
    except Exception as e:
        logger.error(f"Error classifying activity: {e}")
        return "uncertain"

def has_earning_intent(sensor_payload: Optional[List] = None) -> bool:
    """
    Returns True if the activity state implies the worker is actively working.
    Used by the WIVE pipeline.
    """
    label = classify_activity(sensor_payload)
    return label in EARNING_INTENT_STATES
