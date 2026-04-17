from typing import Dict, Any, List

class ExplainabilityEngine:
    @staticmethod
    def explain_premium(expected_loss: float, metadata: dict) -> Dict[str, Any]:
        """
        Converts the XGBoost premium prediction and SHAP values into an API-ready response.
        """
        top_features = metadata.get("top_contributing_features", [])
        
        primary_factors = [
            f"{feat['feature']} (Impact: {feat['impact']:.2f})" 
            for feat in top_features
        ]
        
        if top_features:
            top_feat_name = top_features[0]['feature']
            reasoning = f"The most significant factor driving your risk profile is {top_feat_name}."
        else:
            reasoning = "Your premium is based on baseline demographic and zone factors."
            
        plain_text = f"Expected weekly loss modeled at ${expected_loss:.2f}."
        human_summary = f"Based on your profile, the AI models project an average loss of ${expected_loss:.2f} per week during typical disruptions. {reasoning}"
        
        return {
            "primary_factors": primary_factors,
            "plain_text": plain_text,
            "recommendation_reasoning": reasoning,
            "human_summary": human_summary,
            "payout_breakdown": None  # Not applicable for premium quote
        }

    @staticmethod
    def explain_fraud_routing(anomaly_score: float, lane: str, metadata: dict) -> Dict[str, Any]:
        """
        Converts the Isolation Forest results into clear textual routing logic.
        """
        reasons = []
        if metadata.get("raw_decision_score"):
            reasons.append(f"Model Anomaly Score: {anomaly_score:.2f}")
            
        if lane == "HIGH":
            human_summary = "Claim routed to HIGH confidence lane. Very low anomaly detected. Fast-tracked for auto-payout."
            recommendation_reasoning = "The claim footprint strongly aligns with verified worker behavior."
        elif lane == "MEDIUM":
            human_summary = "Claim routed to MEDIUM confidence lane. Mild anomalies detected. Requires standard automated checks."
            recommendation_reasoning = "The claim footprint has minor deviations from baseline but no critical flags."
        else:
            human_summary = "Claim routed to REVIEW lane. High anomaly indicators detected. Requires human actuary review."
            recommendation_reasoning = "The claim differs significantly from standard patterns (e.g., GPS spoofing likelihood or erratic session drops)."
            
        return {
            "primary_factors": reasons,
            "plain_text": f"Anomaly Score: {anomaly_score:.2f} | Routing: {lane}",
            "recommendation_reasoning": recommendation_reasoning,
            "human_summary": human_summary,
            "payout_breakdown": None
        }

    @staticmethod
    def explain_payout(payout_amount: float, weekly_cap: float, estimated_loss: float) -> Dict[str, Any]:
        """
        Explains how the final payout was derived.
        Must enforce final_payout <= weekly_cap, and protection_ratio = payout / estimated_loss.
        """
        final_payout = min(payout_amount, weekly_cap)
        protection_ratio = final_payout / estimated_loss if estimated_loss > 0 else 0.0
        
        human_summary = f"Your calculated payout is ${final_payout:.2f}, providing a {protection_ratio*100:.1f}% protection ratio against your expected loss of ${estimated_loss:.2f}."
        
        reasoning = "The payout fully replaces your modeled structural loss up to your policy cap."
        if final_payout == weekly_cap and payout_amount > weekly_cap:
            reasoning = "The calculated payout exceeded your policy limit and has been capped at the maximum weekly limit."
            
        payout_breakdown = {
            "raw_calculated_amount": round(payout_amount, 2),
            "weekly_policy_cap": round(weekly_cap, 2),
            "final_approved_payout": round(final_payout, 2),
            "estimated_loss_baseline": round(estimated_loss, 2),
            "protection_ratio": round(protection_ratio, 3)
        }
        
        return {
            "primary_factors": [
                f"Calculated amount vs Weekly Cap constraint",
                f"Protection ratio maintenance"
            ],
            "plain_text": f"Payout authorized for ${final_payout:.2f}.",
            "recommendation_reasoning": reasoning,
            "human_summary": human_summary,
            "payout_breakdown": payout_breakdown
        }

    @staticmethod
    def format_api_response(status: str, message: str, data: dict, request_id: str) -> dict:
        """
        Ensures strict adherence to the API contract envelope.
        """
        import time
        return {
            "status": status,
            "message": message,
            "data": data,
            "timestamp": int(time.time()),
            "request_id": request_id
        }
