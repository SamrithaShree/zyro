import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { usePolicyStore, PlanOption } from "../../store/usePolicyStore";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { 
  Shield, 
  ChevronRight, 
  TrendingDown, 
  Zap, 
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";

export function QuoteScreen() {
  const navigate = useNavigate();
  const { data: onboardingData } = useOnboardingStore();
  const { fetchQuotes, quotes, recommendedTier, riskScore, disruptionProbability, isLoading } = usePolicyStore();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  useEffect(() => {
    if (onboardingData.zone && onboardingData.incomeBand) {
      fetchQuotes(onboardingData.zone, onboardingData.incomeBand);
    }
  }, [onboardingData.zone, onboardingData.incomeBand, fetchQuotes]);

  useEffect(() => {
    if (recommendedTier) {
      setSelectedTier(recommendedTier);
    }
  }, [recommendedTier]);

  const handleSelectPlan = (tier: string) => {
    setSelectedTier(tier);
  };

  const handleContinue = () => {
    if (selectedTier) {
      navigate("/policy-review", { state: { tier: selectedTier } });
    }
  };

  if (isLoading && quotes.length === 0) {
    return (
      <MobileContainer style={{ backgroundColor: "#BEE9E8" }}>
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#62B6CB]" />
          <p className="text-[#1B4965] font-bold">Analyzing your risk profile...</p>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer style={{ backgroundColor: "#BEE9E8" }}>
      <div className="px-8 pt-10 pb-32 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <span className="text-[10px] font-black text-[#62B6CB] uppercase tracking-widest">PERSONALIZED QUOTE</span>
          <h1 className="text-3xl font-black text-[#1B4965] tracking-tight">Protection Plans</h1>
          <p className="text-sm text-[#1B4965]/60">Based on your earning intent in {onboardingData.zone}.</p>
        </div>

        {/* ML Insights Strip */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-[#1B4965]/5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-[#62B6CB]" />
              <span className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-tighter">RISK SCORE</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-[#1B4965]">{riskScore}</span>
              <span className="text-[10px] font-bold text-[#62B6CB]">/ 1.0</span>
            </div>
          </div>
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-[#1B4965]/5">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-[#62B6CB]" />
              <span className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-tighter">DISRUPTION %</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-[#1B4965]">{Math.round((disruptionProbability || 0) * 100)}%</span>
              <span className="text-[10px] font-bold text-[#62B6CB]">PROB.</span>
            </div>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="space-y-4">
          {quotes.map((plan) => (
            <motion.div
              key={plan.tier}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectPlan(plan.tier)}
              className={`relative p-6 rounded-[32px] border-2 transition-all cursor-pointer ${
                selectedTier === plan.tier 
                  ? "bg-[#1B4965] border-[#62B6CB] text-white shadow-2xl" 
                  : "bg-white border-transparent text-[#1B4965] shadow-xl"
              }`}
            >
              {recommendedTier === plan.tier && (
                <div className="absolute -top-3 left-6 bg-[#62B6CB] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  Recommended
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight">{plan.tier}</h3>
                  <div className="flex items-center gap-2">
                    <Shield className={`w-3 h-3 ${selectedTier === plan.tier ? "text-[#62B6CB]" : "text-[#1B4965]/40"}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedTier === plan.tier ? "text-white/60" : "text-[#1B4965]/40"}`}>
                      {plan.intended_protection_level} Protection
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black">₹{plan.premium_amount}</span>
                  <span className={`text-[10px] block font-bold uppercase ${selectedTier === plan.tier ? "text-white/40" : "text-[#1B4965]/40"}`}>/ week</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-t border-current/10">
                <div>
                  <span className={`text-[10px] font-bold uppercase block mb-0.5 ${selectedTier === plan.tier ? "text-white/40" : "text-[#1B4965]/40"}`}>Hourly Benefit</span>
                  <span className="text-lg font-black">₹{plan.hourly_benefit}</span>
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase block mb-0.5 ${selectedTier === plan.tier ? "text-white/40" : "text-[#1B4965]/40"}`}>Weekly Cap</span>
                  <span className="text-lg font-black">₹{plan.weekly_cap}</span>
                </div>
              </div>

              {selectedTier === plan.tier && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-white/60 pt-4 border-t border-white/10 italic"
                >
                  {plan.explanation}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Selection Indicator */}
        <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#BEE9E8] via-[#BEE9E8] to-transparent pointer-events-none">
          <Button 
            onClick={handleContinue}
            disabled={!selectedTier}
            className="w-full h-16 rounded-2xl bg-[#1B4965] text-white font-black text-lg shadow-2xl shadow-[#1B4965]/40 pointer-events-auto flex items-center justify-center gap-2"
          >
            Review Selected Plan
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}
