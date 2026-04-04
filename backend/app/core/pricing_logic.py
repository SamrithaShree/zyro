from typing import Dict, List, Any

# Zone-level seeded risk data for Phase 2
ZONE_RISK_DATA: Dict[str, Dict[str, Any]] = {
    "Anna Nagar": {
        "disruption_probability": 0.25,
        "expected_hours_lost": 4.5,
        "drivers": ["Rain-heavy zone", "High traffic density"]
    },
    "T Nagar": {
        "disruption_probability": 0.20,
        "expected_hours_lost": 3.5,
        "drivers": ["Commercial hub", "Moderate flood risk"]
    },
    "Adyar": {
        "disruption_probability": 0.15,
        "expected_hours_lost": 2.5,
        "drivers": ["Residential zone", "Lower disruption history"]
    },
    "Velachery": {
        "disruption_probability": 0.30,
        "expected_hours_lost": 5.5,
        "drivers": ["Extreme flood risk", "Rapid urban development"]
    },
    "Ambattur": {
        "disruption_probability": 0.18,
        "expected_hours_lost": 3.0,
        "drivers": ["Industrial area", "Consistent order flow"]
    },
    "DEFAULT": {
        "disruption_probability": 0.12,
        "expected_hours_lost": 2.0,
        "drivers": ["Standard risk profile"]
    }
}

# Income band to average weekly income mapping
INCOME_BAND_TO_VALUE: Dict[str, int] = {
    "< 3,000": 2500,
    "3,000 - 5,000": 4000,
    "5,000 - 7,000": 6000,
    "7,000 - 9,000": 8000,
    "9,000+": 11000
}

# Plan Tier Configuration
PLAN_TIERS = {
    "Basic": {
        "replacement_fraction": 0.40,
        "covered_triggers": ["RAIN"],
        "hourly_multiplier": 0.8, # Factor of base hourly rate
        "cap_multiplier": 3,      # 3x hourly benefit
        "explanation_template": "A lightweight safety net focusing on major weather disruptions."
    },
    "Standard": {
        "replacement_fraction": 0.65,
        "covered_triggers": ["RAIN", "TRAFFIC", "PLATFORM_DOWNTIME"],
        "hourly_multiplier": 1.0,
        "cap_multiplier": 5,      # 5x hourly benefit
        "explanation_template": "The recommended balance of cost and protection for most partners."
    },
    "Premium": {
        "replacement_fraction": 0.70,
        "covered_triggers": ["RAIN", "TRAFFIC", "PLATFORM_DOWNTIME", "AIR_QUALITY", "CURFEW"],
        "hourly_multiplier": 1.2,
        "cap_multiplier": 8,      # 8x hourly benefit
        "explanation_template": "Maximum protection for high-earning intent across all disruption types."
    }
}

LOADING_FACTOR = 1.4

def calculate_expected_weekly_loss(income_band: str, zone: str, weekly_working_hours: int) -> int:
    income = INCOME_BAND_TO_VALUE.get(income_band, 4000)
    risk = ZONE_RISK_DATA.get(zone, ZONE_RISK_DATA["DEFAULT"])
    
    prob = risk["disruption_probability"]
    hours_lost = risk["expected_hours_lost"]
    
    # Formulation: income * prob * (hours_lost / working_hours)
    loss = income * prob * (hours_lost / weekly_working_hours)
    return int(round(loss))

def get_plan_options(income_band: str, zone: str, working_hours_per_day: int, days_worked_per_week: int) -> List[Dict[str, Any]]:
    weekly_working_hours = working_hours_per_day * days_worked_per_week
    expected_loss = calculate_expected_weekly_loss(income_band, zone, weekly_working_hours)
    
    risk_info = ZONE_RISK_DATA.get(zone, ZONE_RISK_DATA["DEFAULT"])
    base_hourly_rate = INCOME_BAND_TO_VALUE.get(income_band, 4000) / weekly_working_hours
    
    options = []
    for tier_name, config in PLAN_TIERS.items():
        fraction = config["replacement_fraction"]
        
        # Formulation: base_premium = loss * fraction * loading
        base_premium = expected_loss * fraction * LOADING_FACTOR
        final_premium = max(19, min(149, int(round(base_premium))))
        
        hourly_benefit = int(round(base_hourly_rate * config["hourly_multiplier"]))
        weekly_cap = hourly_benefit * config["cap_multiplier"]
        
        # Custom explanation
        explanation = f"{config['explanation_template']} Since you work in {zone}, we identified {', '.join(risk_info['drivers']).lower()} as your key risk factors."
        
        options.append({
            "tier": tier_name,
            "premium_amount": final_premium,
            "hourly_benefit": hourly_benefit,
            "weekly_cap": weekly_cap,
            "covered_triggers": config["covered_triggers"],
            "replacement_fraction": fraction,
            "expected_weekly_loss": expected_loss,
            "intended_protection_level": f"{int(fraction * 100)}%",
            "pricing_drivers": risk_info["drivers"],
            "explanation": explanation
        })
        
    return options
