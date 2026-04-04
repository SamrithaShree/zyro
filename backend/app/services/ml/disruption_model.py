from typing import List
from app.services.ml.risk_model import ZONE_RISK_MAPPING

TRIGGER_IMPACT = {
    "HEAVY_RAIN": 1.4,
    "TRAFFIC_DISRUPTION": 1.25,
    "SEVERE_AQI": 1.15,
    "EXTREME_HEAT": 1.1,
    "PLATFORM_DOWNTIME": 1.5
}

def predict_disruption_probability(zone: str, trigger_types: List[str]) -> float:
    """
    Predicts the probability of disruption in a given zone for specific triggers.
    Clamped between 0.05 and 0.6 for realism.
    """
    # 1. Base Probability from Zone history
    # Convert zone risk (0.0 - 1.0) to a base probability range (0.05 - 0.3)
    base_zone_risk = ZONE_RISK_MAPPING.get(zone, 0.4)
    base_prob = 0.05 + (base_zone_risk * 0.25)
    
    # 2. Add impact of trigger types
    multiplier = 1.0
    for trigger in trigger_types:
        multiplier *= TRIGGER_IMPACT.get(trigger, 1.0)
        
    final_prob = base_prob * multiplier
    
    # 3. Final Clamping
    final_prob = min(max(final_prob, 0.05), 0.6)
    
    return round(final_prob, 2)
