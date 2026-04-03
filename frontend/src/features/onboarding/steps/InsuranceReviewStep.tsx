import { useState, useEffect } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { Button } from "../../../app/components/ui/button";
import { Checkbox } from "../../../app/components/ui/checkbox";
import { Loader2, ChevronRight } from "lucide-react";
import { apiService } from "../../../services/api";
import { useNavigate } from "react-router";

const INCOME_MAPPING: Record<string, string> = {
  "Less than ₹3,000": "< 3,000",
  "₹3,000 - ₹5,000": "3,000 - 5,000",
  "₹5,000 - ₹7,000": "5,000 - 7,000",
  "₹7,000 - ₹9,000": "7,000 - 9,000",
  "₹9,000 - ₹12,000": "9,000+",
  "More than ₹12,000": "9,000+"
};

export function InsuranceReviewStep() {
  const { data, complete } = useOnboardingStore();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [agreed, setAgreed] = useState({
    premium: false,
    coverage: false,
    exclusions: false,
    terms: false
  });

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await apiService.policy.getQuote(
          data.zone || "Anna Nagar",
          INCOME_MAPPING[data.incomeBand] || "3,000 - 5,000"
        );
        setQuote(response.data.data);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [data.zone, data.incomeBand]);

  const handleFinish = async () => {
    setActivating(true);
    try {
      await apiService.policy.acknowledge({
        premium_acknowledged: agreed.premium,
        coverage_acknowledged: agreed.coverage,
        exclusions_acknowledged: agreed.exclusions,
        terms_accepted: agreed.terms,
        privacy_accepted: true
      });
      await apiService.policy.activate();
      complete();
      navigate("/dashboard");
    } catch (err) {
      // Handled by interceptor
    } finally {
      setActivating(false);
    }
  };

  const isComplete = agreed.premium && agreed.coverage && agreed.exclusions && agreed.terms;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#62B6CB] mb-4" />
        <p className="text-xl font-bold text-[#1B4965]">Calculating your plan...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1B4965] mb-2">Policy Review</h2>
        <p className="text-[#1B4965]/60">Review your coverage before activating.</p>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pb-4">
        {/* Quote Card */}
        <div className="bg-[#1B4965] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
           <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                 <div>
                    <span className="text-[10px] font-black text-[#62B6CB] uppercase tracking-widest">WEEKLY PREMIUM</span>
                    <h3 className="text-4xl font-black">₹{quote.premiumAmount}</h3>
                 </div>
                 <div className="bg-[#62B6CB] px-3 py-1 rounded-full text-[10px] font-bold">ACTIVE WEEKLY</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                 <div>
                    <span className="text-[10px] font-bold text-white/50 uppercase">HOURLY BENEFIT</span>
                    <p className="text-lg font-bold">₹{quote.hourlyBenefit}</p>
                 </div>
                 <div>
                    <span className="text-[10px] font-bold text-white/50 uppercase">WEEKLY CAP</span>
                    <p className="text-lg font-bold">₹{quote.weeklyCap}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-4">
           <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border-2 border-[#1B4965]/5">
              <Checkbox checked={agreed.premium} onCheckedChange={(v) => setAgreed(s => ({ ...s, premium: !!v }))} />
              <p className="text-xs text-[#1B4965]/80 font-medium">I understand that ₹{quote.premiumAmount} will be deducted weekly for this protection.</p>
           </div>
           <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border-2 border-[#1B4965]/5">
              <Checkbox checked={agreed.coverage} onCheckedChange={(v) => setAgreed(s => ({ ...s, coverage: !!v }))} />
              <p className="text-xs text-[#1B4965]/80 font-medium">I understand the coverage is parametric and only applies in my registered zone: {data.zone}.</p>
           </div>
           <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border-2 border-[#1B4965]/5">
              <Checkbox checked={agreed.exclusions} onCheckedChange={(v) => setAgreed(s => ({ ...s, exclusions: !!v }))} />
              <div className="flex-1">
                 <p className="text-xs text-[#1B4965]/80 font-medium mb-1">I have read the exclusions (war, pandemic, etc.).</p>
                 <button className="text-[10px] font-bold text-[#62B6CB] flex items-center">View Full Exclusions <ChevronRight className="w-3 h-3" /></button>
              </div>
           </div>
           <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border-2 border-[#1B4965]/5">
              <Checkbox checked={agreed.terms} onCheckedChange={(v) => setAgreed(s => ({ ...s, terms: !!v }))} />
              <p className="text-xs text-[#1B4965]/80 font-medium">I agree to the Zyro Policy Document and IRDAI Sandbox terms.</p>
           </div>
        </div>
      </div>

      <Button
        onClick={handleFinish}
        disabled={!isComplete || activating}
        className="w-full h-16 rounded-2xl font-bold text-lg bg-[#62B6CB] text-white mt-4 shadow-lg shadow-[#62B6CB]/20"
      >
        {activating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Activate & Go to Dashboard"}
      </Button>
    </div>
  );
}
