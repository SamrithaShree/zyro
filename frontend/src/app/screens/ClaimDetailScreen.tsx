import React from "react";
import { useLocation, useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { 
  ArrowLeft as ArrowLeftIcon, 
  ShieldCheck as ShieldCheckIcon, 
  AlertCircle as AlertCircleIcon, 
  Zap as ZapIcon, 
  CheckCircle2 as CheckCircle2Icon, 
  Info as InfoIcon 
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useClaimStore } from "../../store/useClaimStore";
import { toast } from "sonner";

export function ClaimDetailScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { claimId } = location.state || {};
  const { claims, payoutClaim, isLoading } = useClaimStore();
  const claim = claims.find(c => c.claim_id === claimId);

  if (!claim) {
    return (
      <MobileContainer style={{ backgroundColor: "#BEE9E8" }}>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <AlertCircleIcon className="w-12 h-12 text-[#1B4965]/20" />
          <p className="text-[#1B4965] font-bold">Claim not found</p>
          <Button onClick={() => navigate("/dashboard")} className="bg-[#62B6CB] text-white rounded-xl">Back to Dashboard</Button>
        </div>
      </MobileContainer>
    );
  }

  const handlePayout = async () => {
    try {
      await payoutClaim(claim.claim_id);
      toast.success("Payout executed successfully!");
    } catch (error) {
      // handled
    }
  };

  const isEligible = claim.status === "ELIGIBLE";
  const isPaid = claim.status === "PAID";
  const isRejected = claim.status === "REJECTED";

  return (
    <MobileContainer style={{ backgroundColor: "#BEE9E8" }}>
      <div className="px-8 pt-10 pb-32 space-y-8 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center text-[#1B4965]">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-[#1B4965]">Claim Review</h1>
        </div>

        {/* Status Hero */}
        <div className={`rounded-[32px] p-8 shadow-2xl relative overflow-hidden ${
          isPaid ? "bg-green-600 text-white" : 
          isRejected ? "bg-red-600 text-white" : 
          "bg-[#1B4965] text-white"
        }`}>
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">CURRENT STATUS</span>
                <h2 className="text-4xl font-black tracking-tight">{claim.status}</h2>
              </div>
              {isPaid ? <CheckCircle2Icon className="w-10 h-10" /> : <ShieldCheckIcon className="w-10 h-10 text-[#62B6CB]" />}
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/5">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-2">Estimated Income Loss</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">₹{claim.estimated_loss}</span>
                <span className="text-sm font-bold text-white/60">VALIDATED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payout Details */}
        <div className="bg-white rounded-[32px] p-8 shadow-xl space-y-6 border border-[#1B4965]/5">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[#1B4965]/5">
              <span className="text-xs font-bold text-[#1B4965]/40 uppercase">Payout Amount</span>
              <span className="text-xl font-black text-[#1B4965]">₹{claim.payout_amount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#1B4965]/5">
              <span className="text-xs font-bold text-[#1B4965]/40 uppercase">Protection Ratio</span>
              <span className="text-lg font-black text-[#62B6CB]">{Math.round(claim.protection_ratio * 100)}%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-bold text-[#1B4965]/40 uppercase">Uncovered Loss</span>
              <span className="text-lg font-black text-red-500">₹{claim.uncovered_loss}</span>
            </div>
          </div>

          <div className="bg-[#BEE9E8]/30 p-5 rounded-2xl flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-[#62B6CB] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
               <span className="text-[10px] font-black text-[#1B4965]/40 uppercase">REASONING</span>
               <p className="text-xs font-medium text-[#1B4965] leading-relaxed">
                 {claim.explanation}
               </p>
            </div>
          </div>
        </div>

        {/* Action */}
        {isEligible && (
          <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#BEE9E8] via-[#BEE9E8] to-transparent pointer-events-none">
            <Button 
              onClick={handlePayout}
              disabled={isLoading}
              className="w-full h-16 rounded-2xl bg-[#62B6CB] text-white font-black text-lg shadow-2xl shadow-[#62B6CB]/40 pointer-events-auto flex items-center justify-center gap-2"
            >
              Confirm Payout
              <ZapIcon className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
