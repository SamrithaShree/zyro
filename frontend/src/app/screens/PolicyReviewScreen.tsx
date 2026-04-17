import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { usePolicyStore } from "../../store/usePolicyStore";
import { 
  ShieldCheck, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  Loader2,
  FileText
} from "lucide-react";
import { Button } from "../components/ui/button";
import { apiService } from "../../services/api";
import { toast } from "sonner";

export function PolicyReviewScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tier } = location.state || { tier: "Standard" };
  const { quotes, activatePolicy, isLoading } = usePolicyStore();
  const plan = quotes.find(q => q.tier === tier) || quotes[0];

  const [acknowledgements, setAcknowledgements] = useState({
    premium: false,
    coverage: false,
    terms: false
  });

  const handleToggle = (key: keyof typeof acknowledgements) => {
    setAcknowledgements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(acknowledgements).every(v => v);

  const handleActivate = async () => {
    if (!allChecked) return;
    
    try {
      // 1. Acknowledge on backend
      await apiService.policy.acknowledge({
        premium_acknowledged: acknowledgements.premium,
        coverage_acknowledged: acknowledgements.coverage,
        exclusions_acknowledged: true,
        terms_accepted: acknowledgements.terms,
        privacy_accepted: acknowledgements.terms
      });

      // 2. Activate
      await activatePolicy(tier);
      
      toast.success("Policy activated successfully!");
      navigate("/dashboard");
    } catch (error) {
      // toast handled by api interceptor
    }
  };

  if (!plan) return null;

  return (
    <MobileContainer style={{ backgroundColor: "#BEE9E8" }}>
      <div className="px-8 pt-10 pb-32 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center text-[#1B4965]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-[#1B4965]">Review Policy</h1>
        </div>

        {/* Selected Plan Summary */}
        <div className="bg-[#1B4965] rounded-[32px] p-8 text-white shadow-2xl space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black text-[#62B6CB] uppercase tracking-widest block mb-1">SELECTED PLAN</span>
              <h2 className="text-3xl font-black tracking-tight">{plan.tier}</h2>
            </div>
            <ShieldCheck className="w-10 h-10 text-[#62B6CB]" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-xs font-bold text-white/40 uppercase">Premium</span>
              <span className="text-lg font-black text-[#62B6CB]">₹{plan.premium_amount} <span className="text-[10px] text-white/40">/ week</span></span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-xs font-bold text-white/40 uppercase">Hourly Benefit</span>
              <span className="text-lg font-black text-white">₹{plan.hourly_benefit}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-xs font-bold text-white/40 uppercase">Weekly Cap</span>
              <span className="text-lg font-black text-white">₹{plan.weekly_cap}</span>
            </div>
          </div>
        </div>

        {/* Requirements / Acknowledgements */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-[#1B4965] uppercase tracking-wider">Final Requirements</h3>
          
          <div className="space-y-3">
            {[
              { id: 'premium', label: `I agree to pay ₹${plan.premium_amount} weekly premium`, icon: Lock },
              { id: 'coverage', label: `I understand this covers ${plan.covered_triggers.join(', ')}`, icon: ShieldCheck },
              { id: 'terms', label: 'I accept the Parametric Policy Terms & Privacy Policy', icon: FileText },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleToggle(item.id as any)}
                className={`w-full p-5 rounded-2xl flex items-center gap-4 border-2 transition-all ${
                  acknowledgements[item.id as keyof typeof acknowledgements]
                    ? "bg-white border-[#62B6CB] shadow-md"
                    : "bg-white/40 border-transparent"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  acknowledgements[item.id as keyof typeof acknowledgements]
                    ? "bg-[#62B6CB] border-[#62B6CB] text-white"
                    : "border-[#1B4965]/10"
                }`}>
                  {acknowledgements[item.id as keyof typeof acknowledgements] && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <span className={`text-xs font-bold text-left ${
                  acknowledgements[item.id as keyof typeof acknowledgements] ? "text-[#1B4965]" : "text-[#1B4965]/40"
                }`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Activation CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#BEE9E8] via-[#BEE9E8] to-transparent pointer-events-none">
          <Button 
            onClick={handleActivate}
            disabled={!allChecked || isLoading}
            className={`w-full h-16 rounded-2xl font-black text-lg shadow-2xl pointer-events-auto flex items-center justify-center gap-3 transition-all ${
              allChecked 
                ? "bg-[#62B6CB] text-white shadow-[#62B6CB]/30" 
                : "bg-white/20 text-[#1B4965]/20 shadow-none"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Activate {plan.tier} Protection
                <Lock className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}
