from typing import Dict, Tuple

# Hardcoded zone risk levels (0.0 to 1.0) for demo
ZONE_RISK_MAPPING = {
    "Anna Nagar": 0.45,
    "T Nagar": 0.65,
    "Adyar": 0.35,
    "Velachery": 0.75,
    "Mylapore": 0.40,
    "Guindy": 0.55,
    "Tambaram": 0.80,
    "OMR": 0.50
}

PLATFORM_VOLATILITY = {
    "Swiggy": 0.5,
    "Zomato": 0.5,
    "Uber": 0.6,
    "Ola": 0.6,
    "Dunzo": 0.4,
    "Porter": 0.3
}

def compute_risk_score(worker_profile: dict, zone: str) -> Tuple[float, str, str]:
    """
    Computes a normalized risk score (0.0 - 1.0) and returns (score, label, reasoning)
    """
    # 1. Base Zone Risk
    base_risk = ZONE_RISK_MAPPING.get(zone, 0.5)
    
    # 2. Working Hours Intensity (fatigue/exposure)
    # Higher hours = higher exposure risk
    hours = worker_profile.get("working_hours_per_day", 8)
    hours_risk = min(hours / 12.0, 1.0) * 0.3 # Max 30% contribution
    
    # 3. Platform Volatility
    platform = worker_profile.get("platform", "Generic")
    p_risk = PLATFORM_VOLATILITY.get(platform, 0.5) * 0.2 # Max 20% contribution
    
    # 4. Income Band Volatility (Lower income bands often have more volatility)
    income_band = worker_profile.get("income_band", "₹15k - ₹25k")
    income_risk_map = {
        "₹15k - ₹25k": 0.7,
        "₹25k - ₹35k": 0.5,
        "₹35k - ₹45k": 0.3,
        "₹45k+": 0.2
    }
    i_risk = income_risk_map.get(income_band, 0.5) * 0.2 # Max 20% contribution
    
    # Composite Score (weighted)
    final_score = (base_risk * 0.3) + hours_risk + p_risk + i_risk
    final_score = min(max(final_score, 0.0), 1.0)
    
    # Determine Label
    if final_score < 0.35:
        label = "LOW"
        reasoning = "Your risk profile is low due to stable zone patterns and balanced working hours."
    elif final_score < 0.65:
        label = "MEDIUM"
        reasoning = "Moderate exposure detected based on your zone's disruption history and platform volatility."
    else:
        label = "HIGH"
        reasoning = "High risk detected due to extreme disruption frequency in your zone and high exposure hours."
        
    return round(final_score, 2), label, reasoning
