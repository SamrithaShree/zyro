import pandas as pd
import numpy as np

def generate_premium_data(n_samples=5000):
    np.random.seed(42)
    
    # 1. zone_risk: 0.0 to 1.0
    zone_risk = np.random.uniform(0.0, 1.0, n_samples)
    
    # 2. income_band_value: 1 to 5
    income_band_value = np.random.randint(1, 6, n_samples)
    
    # 3. working_hours: 10 to 60 (weekly)
    working_hours = np.random.randint(10, 61, n_samples)
    
    # 4. platform_tenure: 1 to 48 (months)
    platform_tenure = np.random.randint(1, 49, n_samples)
    
    # 5. days_active_last_week: 0 to 7
    days_active_last_week = np.random.randint(0, 8, n_samples)
    
    # 6. zone_disruption_count: 0 to 20
    zone_disruption_count = np.random.randint(0, 21, n_samples)
    
    # Target Logic: Synthetic expected_weekly_loss
    # base loss proportional to hours and income band
    base_loss = (working_hours * 10) * (income_band_value * 0.5)
    
    # risk multipliers
    risk_multiplier = 1.0 + (zone_risk * 0.5) + (zone_disruption_count * 0.05)
    
    # tenure discount (more tenure -> slightly less expected loss due to experience)
    tenure_discount = 1.0 - (platform_tenure * 0.005)
    
    expected_weekly_loss = base_loss * risk_multiplier * tenure_discount
    
    # Add some noise
    noise = np.random.normal(0, 20, n_samples)
    expected_weekly_loss += noise
    
    # Clip to bounds [20, 900]
    expected_weekly_loss = np.clip(expected_weekly_loss, 20, 900)
    
    df = pd.DataFrame({
        'zone_risk': zone_risk,
        'income_band_value': income_band_value,
        'working_hours': working_hours,
        'platform_tenure': platform_tenure,
        'days_active_last_week': days_active_last_week,
        'zone_disruption_count': zone_disruption_count,
        'expected_weekly_loss': expected_weekly_loss
    })
    
    output_file = 'premium_data.csv'
    df.to_csv(output_file, index=False)
    print(f"Generated {n_samples} rows of premium training data to '{output_file}'.")

if __name__ == "__main__":
    generate_premium_data()
