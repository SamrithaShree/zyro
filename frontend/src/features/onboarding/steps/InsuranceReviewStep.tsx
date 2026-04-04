import React, { useState } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { StickyCTA } from "../../../design-system/layouts/StickyCTA";
import { Button } from "../../../design-system/components/Button";
import { ModalSheet } from "../../../design-system/components/ModalSheet";
import { apiService } from "../../../services/api";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useNavigate } from "react-router";

export function InsuranceReviewStep() {
  const navigate = useNavigate();
  const { data, complete, syncWithBackend } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [quote, setQuote] = useState<any>(null);

  React.useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await apiService.policy.getQuote(data.zone || "", data.incomeBand || "");
        if (res.data.status === "SUCCESS") {
          const plans = res.data.data.plans;
          const standardPlan = plans.find((p: any) => p.tier === "Standard") || plans[0];
          setQuote(standardPlan);
        }
      } catch (err) {
        console.error("Failed to fetch quote", err);
      }
    };
    fetchQuote();
  }, [data.zone, data.incomeBand]);

  // Use quote values or fallbacks
  const premium = quote ? quote.premium_amount : "49";
  const cap = quote ? quote.weekly_cap : "2000";
  const tier = quote ? quote.tier : "Standard";

  const handleActivate = async () => {
    if (!accepted) return;
    
    setLoading(true);

    try {
      // Guard: Check if already complete or READY to avoid invalid transition error
      const statusRes = await apiService.auth.getOnboardingStatus();
      if (statusRes.data.status === "SUCCESS") {
        const { onboarding_state } = statusRes.data.data;
        if (onboarding_state === "READY") {
          console.log("Onboarding already READY, skipping transitions");
          await syncWithBackend();
          complete();
          navigate("/dashboard");
          return;
        }
      }

      const ackPayload = {
        premium_acknowledged: true,
        coverage_acknowledged: true,
        exclusions_acknowledged: true,
        terms_accepted: true,
        privacy_accepted: true
      };

      console.log("ACK PAYLOAD:", ackPayload);
      await apiService.policy.acknowledge(ackPayload);
      
      const activatePayload = { tier: "Standard" }; // Defaulting to Standard for Phase 2 prototype
      console.log("ACTIVATE PAYLOAD:", activatePayload);
      
      await apiService.policy.activate(activatePayload);
      await syncWithBackend();
      complete();
      toast.success("Protection Activated!");
      navigate("/dashboard");
    } catch (err: any) {
      // If the error is specifically about the transition, we might still want to proceed to dashboard
      if (err.response?.data?.message?.includes("Invalid onboarding transition")) {
        console.warn("Transition error, but state might be advanced. Syncing and exiting.");
        await syncWithBackend();
        navigate("/dashboard");
        return;
      }
      toast.error(err.response?.data?.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-6">
        {/* Policy Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F4FBFB] p-8 rounded-[32px] shadow-[0_8px_30px_rgba(27,73,101,0.05)] border-2 border-white space-y-8"
        >
          <div className="text-center space-y-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1B4965]/40">Weekly Premium</span>
            <div className="text-[48px] font-black text-[#1B4965] tracking-tighter leading-none">
              ₹{premium}<span className="text-[20px] font-bold text-[#1B4965]/30 tracking-normal ml-1">/wk</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#62B6CB]/5 p-4 rounded-[24px] space-y-1">
              <span className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-widest">Coverage Cap</span>
              <div className="text-[18px] font-bold text-[#1B4965]">₹{cap}</div>
            </div>
            <div className="bg-[#62B6CB]/5 p-4 rounded-[24px] space-y-1">
              <span className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-widest">Duration</span>
              <div className="text-[18px] font-bold text-[#1B4965]">7 Days</div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#1B4965]/5">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-[#62B6CB] flex items-center justify-center shrink-0 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <p className="text-[13px] text-[#1B4965]/70 font-medium">Automatic payout for heavy rain & heat</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-[#62B6CB] flex items-center justify-center shrink-0 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <p className="text-[13px] text-[#1B4965]/70 font-medium">No manual claim filing required</p>
            </div>
          </div>
        </motion.div>

        {/* Consent Section */}
        <div className="pt-4">
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
                ${accepted ? 'bg-[#62B6CB] border-[#62B6CB]' : 'bg-white/20 border-[#1B4965]/20 group-hover:border-[#62B6CB]/40'}
              `} />
              <svg className={`absolute w-4 h-4 text-white transition-opacity ${accepted ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <span className="text-[14px] text-[#1B4965] font-medium leading-tight">
              I agree to the <button onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-[#62B6CB] font-bold">Terms & Conditions</button> and <button onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-[#62B6CB] font-bold">Privacy Policy</button>.
            </span>
          </label>
        </div>
      </div>

      <ModalSheet 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title="Insurance Agreement"
      >
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <section className="space-y-2">
            <h4 className="text-[14px] font-bold text-[#1B4965] uppercase tracking-wider">1. Coverage Details</h4>
            <p className="text-[14px] text-[#1B4965]/70 leading-relaxed">
              Zyro provides parametric income protection. Payouts are triggered when rainfall exceeds 15mm/hr or temperatures exceed 43°C in your operating zone.
            </p>
          </section>
          <section className="space-y-2">
            <h4 className="text-[14px] font-bold text-[#1B4965] uppercase tracking-wider">2. Payout Logic</h4>
            <p className="text-[14px] text-[#1B4965]/70 leading-relaxed">
              Payouts are calculated per-hour of disruption based on your income band. The maximum weekly cap is ₹{cap}.
            </p>
          </section>
          <section className="space-y-2">
            <h4 className="text-[14px] font-bold text-[#1B4965] uppercase tracking-wider">3. Data Usage</h4>
            <p className="text-[14px] text-[#1B4965]/70 leading-relaxed">
              We track your GPS location only when the app is in "Online" mode to verify presence in the affected zone.
            </p>
          </section>
          <section className="space-y-2">
            <h4 className="text-[14px] font-bold text-[#1B4965] uppercase tracking-wider">4. Disclaimer</h4>
            <p className="text-[14px] text-[#1B4965]/70 leading-relaxed italic">
              This is a parametric product. No manual claims are accepted. If data triggers do not hit the threshold, no payout will be issued.
            </p>
          </section>
        </div>
        <Button onClick={() => setShowTerms(false)} variant="secondary" className="mt-8">
          Close Terms
        </Button>
      </ModalSheet>

      <StickyCTA>
        <Button onClick={handleActivate} disabled={!accepted || loading}>
          {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : "Activate Protection"}
        </Button>
      </StickyCTA>
    </div>
  );
}
