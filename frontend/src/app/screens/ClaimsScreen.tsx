import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import { 
  ArrowLeft, 
  History, 
  Zap, 
  CheckCircle2, 
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useClaimStore } from "../../store/useClaimStore";
import { motion } from "motion/react";

export function ClaimsScreen() {
  const navigate = useNavigate();
  const { claims, fetchClaims, isLoading } = useClaimStore();

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  return (
    <MobileContainer hasBottomNav style={{ backgroundColor: "#BEE9E8" }}>
      <div className="px-8 pt-10 pb-24 space-y-8 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center text-[#1B4965]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-[#1B4965]">Claims History</h1>
        </div>

        {/* List */}
        {isLoading && claims.length === 0 ? (
          <div className="flex justify-center py-20">
             <Loader2 className="w-8 h-8 animate-spin text-[#62B6CB]" />
          </div>
        ) : claims.length > 0 ? (
          <div className="space-y-4">
            {claims.map((claim) => (
              <motion.div
                key={claim.claim_id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/claim-detail", { state: { claimId: claim.claim_id } })}
                className="bg-white rounded-[24px] p-5 border border-[#1B4965]/5 flex items-center gap-4 shadow-sm"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  claim.status === 'PAID' ? "bg-green-100 text-green-600" : 
                  claim.status === 'REJECTED' ? "bg-red-100 text-red-600" :
                  "bg-[#1B4965]/5 text-[#1B4965]"
                }`}>
                   {claim.status === 'PAID' ? <CheckCircle2 className="w-6 h-6" /> : 
                    claim.status === 'REJECTED' ? <AlertCircle className="w-6 h-6" /> :
                    <Zap className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-black uppercase tracking-tight ${
                        claim.status === 'PAID' ? "text-green-600" : 
                        claim.status === 'REJECTED' ? "text-red-600" : "text-[#1B4965]/60"
                      }`}>{claim.status}</span>
                      <span className="text-[10px] font-bold text-[#1B4965]/40">{new Date(claim.created_at).toLocaleDateString()}</span>
                   </div>
                   <p className="text-lg font-black text-[#1B4965]">₹{claim.payout_amount}</p>
                   <p className="text-[10px] text-[#1B4965]/60 line-clamp-1">{claim.explanation}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#1B4965]/20" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
             <History className="w-16 h-16 text-[#1B4965]" />
             <div className="space-y-1">
                <h3 className="text-lg font-black text-[#1B4965]">No disruptions yet</h3>
                <p className="text-xs font-bold text-[#1B4965]">Your income is safe and active.</p>
             </div>
          </div>
        )}
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
