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
          setRecommendationReason(quoteData.risk_reasoning || "Optimized for your zone's risk nodes.");
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
      
      await syncWithBackend();
      complete();
      toast.success(`${selectedTier} Protection Activated!`);
      navigate("/dashboard");
    } catch (err: any) {
      // If we hit a transition error but the backend says we're actually ready/protected,
      // just recover and go to dashboard
      const msg = err.response?.data?.detail?.message || err.response?.data?.message || "";
      if (msg.includes("Invalid onboarding transition") || msg.includes("already exists")) {
        await syncWithBackend();
        navigate("/dashboard");
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
        <Loader2 className="w-12 h-12 text-[#62B6CB] animate-spin" />
        <p className="text-[#1B4965]/60 font-black uppercase tracking-widest text-[10px]">Analyzing Earning Intent</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[#1B4965] tracking-tight italic uppercase">Select Coverage</h2>
        <p className="text-[#1B4965]/60 text-sm font-bold italic">{recommendationReason}</p>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 gap-4">
        {plans.map((plan) => {
          const isRecommended = plan.tier === recommendedTier;
          const isSelected = plan.tier === selectedTier;
          
          return (
            <motion.div
              key={plan.tier}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTier(plan.tier)}
              className={`relative p-6 rounded-[32px] border-2 transition-all cursor-pointer ${
                isSelected 
                  ? "bg-white border-[#62B6CB] shadow-2xl shadow-[#62B6CB]/20" 
                  : "bg-white/40 border-[#1B4965]/5 opacity-80"
              }`}
            >
              {isRecommended && (
                <div className="absolute -top-3 right-8 bg-[#1B4965] text-[#00FF87] text-[10px] font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-widest shadow-xl italic">
                  <Star className="w-3 h-3 fill-[#00FF87] stroke-[#00FF87]" />
                  Best Match
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-xl font-black italic uppercase ${isSelected ? "text-[#1B4965]" : "text-[#1B4965]/40"}`}>{plan.tier}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-[#1B4965] italic">₹{plan.premium_amount}</span>
                    <span className="text-[11px] font-black text-[#1B4965]/30 uppercase tracking-tighter italic">/ Week</span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  isSelected ? "bg-[#62B6CB] text-white shadow-lg" : "bg-[#1B4965]/5 text-[#1B4965]/20"
                }`}>
                  {isSelected ? <CheckCircle2 className="w-6 h-6" strokeWidth={3} /> : <Shield className="w-6 h-6" />}
                </div>
              </div>

              <div className="space-y-2 text-[12px] font-bold text-[#1B4965]/60 italic uppercase tracking-tight">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#62B6CB]" />
                  <span>₹{plan.weekly_cap} weekly benefit cap</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#62B6CB]" />
                  <span className="truncate">Covers: {plan.covered_triggers.join(", ")}</span>
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
            className="bg-[#1B4965] p-8 rounded-[40px] text-white shadow-2xl space-y-6"
          >
            <div>
               <h4 className="text-[10px] font-black text-[#62B6CB] uppercase tracking-[0.3em] mb-3 italic">Autonomous Protocol</h4>
               <p className="text-[15px] text-white/80 leading-relaxed font-medium italic">
                 "{selectedPlan.explanation}"
               </p>
            </div>
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
               <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">Income replacement</span>
               <span className="text-sm font-black text-[#00FF87] italic tracking-tighter">{selectedPlan.intended_protection_level} Efficiency</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consent Section */}
      <div className="pt-2 px-2">
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-1">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <div className={`
              w-7 h-7 rounded-xl border-2 transition-all
              ${accepted ? 'bg-[#62B6CB] border-[#62B6CB] shadow-lg shadow-[#62B6CB]/20' : 'bg-white border-[#1B4965]/10 group-hover:border-[#62B6CB]/40'}
            `} />
            <CheckCircle2 className={`absolute w-5 h-5 text-white transition-opacity ${accepted ? 'opacity-100' : 'opacity-0'}`} strokeWidth={4} />
          </div>
          <span className="text-[14px] text-[#1B4965]/70 font-bold leading-tight pt-0.5">
            I authorize the <button onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-[#62B6CB] font-black underline underline-offset-4 decoration-2">Parametric Contract</button> and verify earning intent.
          </span>
        </label>
      </div>

      <ModalSheet 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title="Autonomous Protection Contract"
      >
        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
          <section className="space-y-3">
            <h4 className="text-[12px] font-black text-[#1B4965] uppercase tracking-widest italic border-b border-[#1B4965]/5 pb-2">1. Protocol Coverage</h4>
            <p className="text-[14px] text-[#1B4965]/70 leading-relaxed font-bold italic">
              Active plan: <strong>{selectedTier}</strong>. Payouts trigger automatically upon WIVE node validation of environmental anomalies in your zone.
            </p>
          </section>
          <section className="space-y-3">
            <h4 className="text-[12px] font-black text-[#1B4965] uppercase tracking-widest italic border-b border-[#1B4965]/5 pb-2">2. Settlement Logic</h4>
            <p className="text-[14px] text-[#1B4965]/70 leading-relaxed font-bold italic">
              Hourly benefit: ₹{selectedPlan?.hourly_benefit}. Settlements are deterministic and transferred instantly to your authorized UPI node.
            </p>
          </section>
          <section className="space-y-3">
            <h4 className="text-[12px] font-black text-[#1B4965] uppercase tracking-widest italic border-b border-[#1B4965]/5 pb-2">3. Retention Cap</h4>
            <p className="text-[14px] text-[#1B4965]/70 leading-relaxed font-bold italic">
              Max weekly extraction: ₹{selectedPlan?.weekly_cap}. Global pool refreshes every 7 orbital cycles.
            </p>
          </section>
        </div>
        <Button onClick={() => setShowTerms(false)} variant="secondary" className="mt-10 h-14 rounded-2xl font-black uppercase">
          Acknowledge Terms
        </Button>
      </ModalSheet>

      <StickyCTA className="bg-white/90 backdrop-blur-xl border-t border-[#1B4965]/5">
        <Button onClick={handleActivate} disabled={!accepted || loading || !selectedTier} className="h-16 rounded-[28px] text-lg font-black uppercase italic tracking-tight">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `Authorize ${selectedTier} Node`}
        </Button>
      </StickyCTA>
    </div>
  );
}
