import pandas as pd
import numpy as np

def generate_fraud_data(n_samples=4000):
    np.random.seed(42)
    
    # Normal data (Majority)
    # gps_motion_correlation: 0.8 to 1.0
    # session_continuity: 0.7 to 1.0
    # zone_visit_freq: 10 to 100
    n_normal = int(n_samples * 0.95)
    normal_gps = np.random.normal(0.9, 0.05, n_normal)
    normal_session = np.random.normal(0.9, 0.05, n_normal)
    normal_zone = np.random.normal(50, 10, n_normal)
    
    # Anomalous data (Minority)
    # low gps correlation, low session continuity, unusual zone visits
    n_anomalous = n_samples - n_normal
    anom_gps = np.random.normal(0.4, 0.1, n_anomalous)
    anom_session = np.random.normal(0.3, 0.1, n_anomalous)
    anom_zone = np.random.normal(2, 1, n_anomalous)
    
    gps = np.concatenate([normal_gps, anom_gps])
    session = np.concatenate([normal_session, anom_session])
    zone = np.concatenate([normal_zone, anom_zone])
    
    # Ensure realistic bounds
    gps = np.clip(gps, 0, 1)
    session = np.clip(session, 0, 1)
    zone = np.clip(zone, 0, 100)
    
    df = pd.DataFrame({
        'gps_motion_correlation': gps,
        'session_continuity': session,
        'zone_visit_freq': zone
    })
    
    output_file = 'fraud_data.csv'
    df.to_csv(output_file, index=False)
    print(f"Generated {n_samples} rows of fraud training data to '{output_file}'.")

if __name__ == "__main__":
    generate_fraud_data()
