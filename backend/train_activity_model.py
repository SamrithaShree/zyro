import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

MODEL_DIR = "app/services/ml/models"
os.makedirs(MODEL_DIR, exist_ok=True)

def train_activity_model():
    print("Training Activity State Classifier (LSTM)...")
    if not os.path.exists("activity_X.npy") or not os.path.exists("activity_y.npy"):
        print("Error: Activity data not found. Run generate_activity_training_data.py first.")
        return False
        
    X_lstm = np.load("activity_X.npy")
    y_lstm = np.load("activity_y.npy")
    
    n_samples = X_lstm.shape[0]
    
    y_lstm_onehot = np.zeros((n_samples, 4))
    y_lstm_onehot[np.arange(n_samples), y_lstm] = 1
    
    model = Sequential([
        # Input shape explicitly required (60, 6)
        LSTM(64, input_shape=(60, 6), return_sequences=False),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dense(4, activation='softmax')
    ])
    
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    model.fit(X_lstm, y_lstm_onehot, epochs=5, batch_size=32, verbose=1)
    
    model_path = os.path.join(MODEL_DIR, "activity_lstm.h5")
    model.save(model_path)
    print(f" -> Saved {model_path}")
    return True

if __name__ == "__main__":
    train_activity_model()
