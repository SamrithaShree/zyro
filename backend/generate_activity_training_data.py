import numpy as np
import os

def generate_activity_data(n_samples=1000):
    np.random.seed(42)
    
    # Shape: (samples, time_steps=60, features=6)
    # Features e.g. [accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z]
    X = np.random.randn(n_samples, 60, 6)
    
    # Classes: 
    # 0: active_delivery
    # 1: waiting_for_order
    # 2: stationary
    # 3: uncertain
    y = np.random.randint(0, 4, n_samples)
    
    # Introduce some logical patterns loosely based on classes
    # 2: stationary -> low variance
    stationary_idx = (y == 2)
    X[stationary_idx] *= 0.1 
    
    # 0: active_delivery -> higher variance
    active_idx = (y == 0)
    X[active_idx] *= 2.0
    
    np.save("activity_X.npy", X)
    np.save("activity_y.npy", y)
    
    print(f"Generated activity training data: X shape {X.shape}, y shape {y.shape}")
    print(" -> Saved activity_X.npy and activity_y.npy")

if __name__ == "__main__":
    generate_activity_data()
