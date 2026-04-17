import os
import numpy as np

# Load the trained LSTM model using keras loader dynamically
try:
    import tensorflow as tf
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "activity_lstm.h5")
    lstm_model = tf.keras.models.load_model(MODEL_PATH)
except Exception as e:
    lstm_model = None
    print(f"Warning: Could not load activity_lstm.h5: {e}")

# Class labels
ACTIVITY_MAPPING = {
    0: "active_delivery",
    1: "waiting",
    2: "stationary",
    3: "uncertain"
}

def classify_activity_state(sensor_payload: list) -> str:
    """
    Classifies a 60-second x 10Hz (600, 6) motion sensor payload using LSTM.
    Output used in WIVE when platform session data is unavailable.
    """
    if lstm_model is None:
        return "uncertain" # Fallback if ML fails to load
        
    try:
        # Convert payload to numpy array
        sequence = np.array(sensor_payload)
        
        # Verify shape (60, 6) or similar sequence length expected by the model
        if sequence.shape != (60, 6):
            return "uncertain"
            
        # Add batch dimension: (1, 60, 6)
        sequence_batch = np.expand_dims(sequence, axis=0)
        
        predictions = lstm_model.predict(sequence_batch, verbose=0)
        class_idx = np.argmax(predictions[0])
        
        confidence = float(predictions[0][class_idx])
        if confidence < 0.35:
            return "uncertain"
            
        return ACTIVITY_MAPPING.get(int(class_idx), "uncertain")
        
    except Exception as e:
        print(f"Activity ML processing error: {e}")
        return "uncertain"

def get_demo_dummy_payload(state_type: str = "active") -> list:
    """Helper to generate a mock payload simulating mobile SDK for API tests."""
    # (60 timestamps, 6 sensor dims)
    payload = np.random.rand(60, 6)
    if state_type == "stationary":
        payload = payload * 0.01 # Extremely low variance
    return payload.tolist()
