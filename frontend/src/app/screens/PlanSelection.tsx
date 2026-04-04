import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { apiService } from "../../services/api";
import { StepContainer } from "../../design-system/layouts/StepContainer";
import { StickyCTA } from "../../design-system/layouts/StickyCTA";
import { Button } from "../../design-system/components/Button";
import { SelectionCard } from "../../design-system/components/SelectionCard";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Zap, Star, Check } from "lucide-react";

export function PlanSelection() {
  const navigate = useNavigate();
  const { data, syncWithBackend } = useOnboardingStore();
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [recommendedTier, setRecommendedTier] = useState("");
  const [selectedTier, setSelectedTier] = useState("");
  const [riskData, setRiskData] = useState<any>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await apiService.policy.getQuote(data.zone || "", data.incomeBand || "");
        if (res.data.status === "SUCCESS") {
          setPlans(res.data.data.plans);
          setRecommendedTier(res.data.data.recommended_tier);
          setSelectedTier(res.data.data.recommended_tier);
          setRiskData({
            score: res.data.data.risk_score,
            label: res.data.data.risk_label,
            reasoning: res.data.data.risk_reasoning
          });
        }
      } catch (err) {
        console.error("Failed to fetch quote", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [data.zone, data.incomeBand]);

  const handleActivate = async () => {
    if (!selectedTier) return;
    
    setActivating(true);
    try {
      // First ensure acknowledgement
      await apiService.policy.acknowledge({
        premium_acknowledged: true,
        coverage_acknowledged: true,
        exclusions_acknowledged: true,
        terms_accepted: true,
        privacy_accepted: true
      });
      
      const res = await apiService.policy.activate({ tier: selectedTier });
      if (res.data.status === "SUCCESS") {
        toast.success(`${selectedTier} Protection Activated!`);
        await syncWithBackend();
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Activation failed");
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="zyro-root font-sans">
        <div className="zyro-atmosphere" />
        <div className="zyro-container flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#62B6CB]/20 border-t-[#62B6CB] rounded-full animate-spin" />
            <p className="text-[#1B4965]/60 font-bold uppercase tracking-widest text-[10px]">Analyzing Risk Profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StepContainer
      step={10}
      totalSteps={10}
      title="Choose Protection"
      subtext="Based on your work in Anna Nagar and ₹5,000+ income band."
      onBack={() => navigate("/dashboard")}
    >
      <div className="space-y-6 pb-10">
        
        {/* Risk Insight Card */}
        {riskData && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/40 backdrop-blur-md rounded-[24px] p-5 border border-white/60 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#62B6CB]/10 flex items-center justify-center text-[#62B6CB]">
                <Zap size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-wider">Risk Level</div>
                <div className="text-[16px] font-black text-[#1B4965] uppercase italic">{riskData.label}</div>
              </div>
            </div>
            <p className="text-[13px] text-[#1B4965]/70 leading-relaxed font-medium">
              {riskData.reasoning}
            </p>
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="space-y-4">
          {plans.map((plan) => (
            <SelectionCard
              key={plan.tier}
              selected={selectedTier === plan.tier}
              onClick={() => setSelectedTier(plan.tier)}
              className="relative p-0 overflow-hidden"
            >
              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[18px] font-black text-[#1B4965] tracking-tight">{plan.tier}</span>
                      {plan.tier === recommendedTier && (
                        <span className="bg-[#1B4965] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[24px] font-black text-[#1B4965]">₹{plan.premium_amount}</span>
                      <span className="text-[12px] font-bold text-[#1B4965]/40">/week</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    selectedTier === plan.tier 
                      ? 'bg-[#1B4965] border-[#1B4965] text-white' 
                      : 'border-[#1B4965]/10 text-transparent'
                  }`}>
                    <Check size={20} strokeWidth={4} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1B4965]/5 p-3 rounded-xl">
                    <div className="text-[9px] font-bold text-[#1B4965]/40 uppercase tracking-wider mb-0.5">Benefit/Hr</div>
                    <div className="text-[14px] font-black text-[#1B4965]">₹{plan.hourly_benefit}</div>
                  </div>
                  <div className="bg-[#1B4965]/5 p-3 rounded-xl">
                    <div className="text-[9px] font-bold text-[#1B4965]/40 uppercase tracking-wider mb-0.5">Weekly Cap</div>
                    <div className="text-[14px] font-black text-[#1B4965]">₹{plan.weekly_cap}</div>
                  </div>
                </div>

                <p className="text-[12px] text-[#1B4965]/60 font-medium italic">
                  {plan.explanation}
                </p>
              </div>
            </SelectionCard>
          ))}
        </div>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-[#1B4965]/40 font-medium px-8">
            You can upgrade or cancel your plan anytime. Payouts are automated via UPI.
          </p>
        </div>
      </div>

      <StickyCTA>
        <Button 
          onClick={handleActivate} 
          disabled={activating || !selectedTier}
        >
          {activating ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            `Activate ${selectedTier} Plan`
          )}
        </Button>
      </StickyCTA>
    </StepContainer>
  );
}
