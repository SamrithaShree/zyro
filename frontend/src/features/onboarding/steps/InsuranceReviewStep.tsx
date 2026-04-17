import React, { useState } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { StickyCTA } from "../../../design-system/layouts/StickyCTA";
import { Button } from "../../../design-system/components/Button";
import { ModalSheet } from "../../../design-system/components/ModalSheet";
import { apiService } from "../../../services/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Shield, CheckCircle2, Star, Info, Loader2 } from "lucide-react";

interface Plan {
  tier: string;
  premium_amount: number;
  hourly_benefit: number;
  weekly_cap: number;
  covered_triggers: string[];
  replacement_fraction: number;
  intended_protection_level: string;
  explanation: string;
}

export function InsuranceReviewStep() {
  const navigate = useNavigate();
  const { data, complete, syncWithBackend } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [recommendedTier, setRecommendedTier] = useState<string>("");
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [recommendationReason, setRecommendationReason] = useState("");

  React.useEffect(() => {
    const fetchQuote = async () => {
      try {
        setFetching(true);
        const res = await apiService.policy.getQuote(data.zone || "", data.incomeBand || "");
        if (res.data.status === "SUCCESS") {
          const quoteData = res.data.data;
          setPlans(quoteData.plans);
          setRecommendedTier(quoteData.recommended_tier);
          setSelectedTier(quoteData.recommended_tier);
          setRecommendationReason(quoteData.risk_reasoning || "Based on your zone's risk profile.");
        }
      } catch (err) {
        console.error("Failed to fetch quote", err);
        toast.error("Failed to load insurance plans");
      } finally {
        setFetching(false);
      }
    };
    fetchQuote();
  }, [data.zone, data.incomeBand]);

  const selectedPlan = plans.find(p => p.tier === selectedTier) || plans.find(p => p.tier === recommendedTier) || plans[0];

  const handleActivate = async () => {
    if (!accepted || !selectedTier) return;
    
    setLoading(true);

    try {
      // 1. Acknowledge (This moves state to READY in backend)
      try {
        await apiService.policy.acknowledge({
          premium_acknowledged: true,
          coverage_acknowledged: true,
          exclusions_acknowledged: true,
          terms_accepted: true,
          privacy_accepted: true
        });
      } catch (err: any) {
        // If already acknowledged/ready, ignore 400 and proceed to activation
        if (err.response?.status !== 400) throw err;
      }
      
      // 2. Activate with SELECTED tier
      await apiService.policy.activate({ tier: selectedTier });
      
      // 3. Mark complete and navigate IMMEDIATELY — do NOT await syncWithBackend
      // before this, as it can overwrite onboardingComplete=true with a stale
      // backend response and send the user back to /login.
      complete();
      toast.success(`${selectedTier} Protection Activated!`);
      navigate("/dashboard");
      
      // Sync in the background after navigation (best-effort)
      syncWithBackend().catch(() => {});
    } catch (err: any) {
      // If we hit a transition error but the backend says we're actually ready,
      // mark complete and go to dashboard anyway.
      const msg = err.response?.data?.detail?.message || err.response?.data?.message || "";
      if (msg.includes("Invalid onboarding transition") || msg.includes("already exists")) {
        complete();
        navigate("/dashboard");
        syncWithBackend().catch(() => {});
        return;
      }
      toast.error(err.response?.data?.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-[#62B6CB]/20 border-t-[#62B6CB] rounded-full animate-spin" />
        <p className="text-[#1B4965]/60 font-bold uppercase tracking-widest text-xs">Analyzing Risk Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[#1B4965] tracking-tight">Select Protection</h2>
        <p className="text-[#1B4965]/60 text-sm font-medium">{recommendationReason}</p>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 gap-3">
        {plans.map((plan) => {
          const isRecommended = plan.tier === recommendedTier;
          const isSelected = plan.tier === selectedTier;
          
          return (
            <motion.div
              key={plan.tier}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTier(plan.tier)}
              className={`relative p-5 rounded-[24px] border-2 transition-all cursor-pointer ${
                isSelected 
                  ? "bg-white border-[#62B6CB] shadow-xl shadow-[#62B6CB]/10" 
                  : "bg-white/40 border-[#1B4965]/5 opacity-80"
              }`}
            >
              {isRecommended && (
                <div className="absolute -top-2.5 right-6 bg-[#1B4965] text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider shadow-lg">
                  <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                  Recommended
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-lg font-black ${isSelected ? "text-[#1B4965]" : "text-[#1B4965]/60"}`}>{plan.tier}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#1B4965]">₹{plan.premium_amount}</span>
                    <span className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-tighter">/ week</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? "bg-[#62B6CB] border-[#62B6CB]" : "border-[#1B4965]/10"
                }`}>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={4} />}
                </div>
              </div>

              <div className="space-y-2 text-[11px] font-bold text-[#1B4965]/70">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#62B6CB]" />
                  <span>Up to ₹{plan.weekly_cap} weekly coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-[#62B6CB]" />
                  <span>Covers: {plan.covered_triggers.join(", ")}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Plan Details */}
      <AnimatePresence mode="wait">
        {selectedPlan && (
          <motion.div
            key={selectedPlan.tier}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#1B4965]/5 p-6 rounded-[28px] border border-[#1B4965]/5"
          >
            <h4 className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.2em] mb-3">Plan Logic</h4>
            <p className="text-sm text-[#1B4965]/80 leading-relaxed font-medium">
              {selectedPlan.explanation}
            </p>
            <div className="mt-4 pt-4 border-t border-[#1B4965]/10 flex items-center justify-between">
               <span className="text-xs font-bold text-[#1B4965]/60">Income Replacement</span>
               <span className="text-xs font-black text-[#62B6CB]">{selectedPlan.intended_protection_level} of expected loss</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consent Section */}
      <div className="pt-2 px-2">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-1">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <div className={`
              w-6 h-6 rounded-lg border-2 transition-all
              ${accepted ? 'bg-[#62B6CB] border-[#62B6CB]' : 'bg-white border-[#1B4965]/20 group-hover:border-[#62B6CB]/40'}
            `} />
            <svg className={`absolute w-4 h-4 text-white transition-opacity ${accepted ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <span className="text-[13px] text-[#1B4965]/70 font-medium leading-tight pt-0.5">
            I accept the <button onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-[#62B6CB] font-bold underline">Policy Terms</button> and confirm this matches my income intent.
          </span>
        </label>
      </div>

      <ModalSheet 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title="Zyro Protection Contract"
      >
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <section className="space-y-2">
            <h4 className="text-[14px] font-bold text-[#1B4965] uppercase tracking-wider">1. Selected Coverage</h4>
            <p className="text-[14px] text-[#1B4965]/70 leading-relaxed">
              You have selected the <strong>{selectedTier}</strong> plan. Payouts are triggered automatically based on verified environmental data in your operating zone.
            </p>
          </section>
          <section className="space-y-2">
            <h4 className="text-[14px] font-bold text-[#1B4965] uppercase tracking-wider">2. Benefit Logic</h4>
            <p className="text-[14px] text-[#1B4965]/70 leading-relaxed">
              Your hourly benefit is ₹{selectedPlan?.hourly_benefit}. Payouts are instant to your linked UPI ID.
            </p>
          </section>
          <section className="space-y-2">
            <h4 className="text-[14px] font-bold text-[#1B4965] uppercase tracking-wider">3. Weekly Cap</h4>
            <p className="text-[14px] text-[#1B4965]/70 leading-relaxed">
              Total payouts are capped at ₹{selectedPlan?.weekly_cap} per week. The policy resets every 7 days.
            </p>
          </section>
        </div>
        <Button onClick={() => setShowTerms(false)} variant="secondary" className="mt-8">
          Understood
        </Button>
      </ModalSheet>

      <StickyCTA className="bg-white/80 backdrop-blur-md">
        <Button onClick={handleActivate} disabled={!accepted || loading || !selectedTier}>
          {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : `Activate ${selectedTier} Protection`}
        </Button>
      </StickyCTA>
    </div>
  );
}
