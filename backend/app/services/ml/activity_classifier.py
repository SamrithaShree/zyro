import os
import numpy as np
import tensorflow as tf

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "activity_lstm.h5")

_model = None

# Exact mapping required
CLASSES = {
    0: "active_delivery",
    1: "waiting_for_order",
    2: "stationary",
    3: "uncertain"
}

def _load_model():
    global _model
    if _model is None:
        try:
            _model = tf.keras.models.load_model(MODEL_PATH)
        except Exception as e:
            print(f"Error loading Activity ML artifact: {e}")

def classify_activity(sequence: np.ndarray) -> tuple[str, float]:
    """
    Classifies an activity sequence of exactly (60, 6).
    Returns (class_name, confidence)
    """
    _load_model()
    
    if _model is None:
        return "uncertain", 0.0
        
    try:
        # User defined strictly require this shape check
        if sequence.shape != (60, 6):
            print(f"Rejecting invalid shape. Expected (60, 6), got {sequence.shape}")
            return "uncertain", 0.0
            
        # Add batch dimension
        X_arr = np.expand_dims(sequence, axis=0)
        
        preds = _model.predict(X_arr, verbose=0)[0]
        max_idx = int(np.argmax(preds))
        confidence = float(preds[max_idx])
        
        # User explicitly requested fallback if confidence < 0.4
        if confidence < 0.4:
            return "uncertain", confidence
            
        return CLASSES.get(max_idx, "uncertain"), confidence
        
    except Exception as e:
        print(f"Error classifying activity: {e}")
        return "uncertain", 0.0
