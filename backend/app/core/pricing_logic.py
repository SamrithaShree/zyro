from typing import Dict

# Locked architectural decisions for pricing
ZONE_RISK_MULTIPLIERS: Dict[str, float] = {
    "Anna Nagar": 1.25,
    "T Nagar": 1.10,
    "Adyar": 1.0,
    "Velachery": 1.30,
    "Ambattur": 1.15,
    "DEFAULT": 0.85
}

# Income band to hourly benefit base rate mapping
INCOME_BAND_TO_HOURLY_BENEFIT: Dict[str, int] = {
    "< 3,000": 80,
    "3,000 - 5,000": 100,
    "5,000 - 7,000": 120,
    "7,000 - 9,000": 140,
    "9,000+": 160
}

# Weekly cap multipliers (fixed per tier for Phase 2 demo)
WEEKLY_CAP_MULTIPLIER = 5  # e.g., 5x hourly benefit as the weekly cap for Standard

def calculate_weekly_premium(zone: str, income_band: str) -> Dict[str, int]:
    multiplier = ZONE_RISK_MULTIPLIERS.get(zone, ZONE_RISK_MULTIPLIERS["DEFAULT"])
    base_rate = INCOME_BAND_TO_HOURLY_BENEFIT.get(income_band, 100)
    
    # Simple parametric formula: (Base Rate * Zone Multiplier * Loading Factor) / Period
    # For Phase 2, we use a calibrated fixed-result formula for demo stability
    hourly_benefit = base_rate
    weekly_cap = base_rate * WEEKLY_CAP_MULTIPLIER
    
    # Premium = (Risk-adjusted rate) * probability * constant
    # We calibrate this to Rs. 19 - 149 range as per README
    loading_factor = 1.4
    disruption_probability = 0.22
    expected_hours_lost = 3.5
    
    raw_premium = (base_rate * multiplier * disruption_probability * expected_hours_lost * loading_factor) / 2
    final_premium = max(19, min(149, int(round(raw_premium))))
    
    return {
        "premium_amount": final_premium,
        "hourly_benefit": hourly_benefit,
        "weekly_cap": weekly_cap
    }
