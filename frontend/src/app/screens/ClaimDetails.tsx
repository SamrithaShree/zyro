import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { 
  Shield, 
  ShieldCheck,
  ShieldAlert,
  CloudRain, 
  Zap, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  ChevronDown,
  Info,
  AlertTriangle,
  Loader2,
  Check,
  Wallet,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiService } from "../../services/api";
import { StepContainer } from "../../design-system/layouts/StepContainer";
import { StickyCTA } from "../../design-system/layouts/StickyCTA";
import { Button } from "../../design-system/components/Button";
import "../../design-system/styles/atmosphere.css";
import { toast } from "sonner";

export function ClaimDetails() {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["event", "eligibility", "calculation"]);

  const fetchClaim = async () => {
    if (!claimId) return;
    try {
      const res = await apiService.claims.getClaim(claimId);
      if (res.data) {
        setClaim(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch claim", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
    // Poll every 3 seconds while on this screen to catch status updates
    const interval = setInterval(fetchClaim, 3000);
    return () => clearInterval(interval);
  }, [claimId]);

  // Auto-show success if claim is already PAID when landing
  useEffect(() => {
    if (claim?.status === "PAID" && !payoutSuccess) {
      setPayoutSuccess(true);
    }
  }, [claim?.status]);

  // Auto-execute payout when claim becomes ELIGIBLE/PAYOUT_READY
  const autoPayoutFiredRef = React.useRef(false);
  useEffect(() => {
    if (
      !autoPayoutFiredRef.current &&
      (claim?.status === "ELIGIBLE" || claim?.status === "PAYOUT_READY") &&
      !payoutSuccess &&
      !executing
    ) {
      autoPayoutFiredRef.current = true;
      // Small delay for UX — let the user see the screen momentarily
      setTimeout(() => {
        handleExecutePayout();
      }, 1500);
    }
  }, [claim?.status]);

  const handleExecutePayout = async () => {
    setExecuting(true);
    try {
      const res = await apiService.claims.payout(claimId!);
      if (res.data.status === "SUCCESS") {
        setPayoutSuccess(true);
        toast.success("Payout Transferred Successfully");
        setTimeout(() => {
           navigate("/dashboard");
        }, 3000);
      }
    } catch (err) {
      toast.error("Payout execution failed");
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="zyro-root font-sans bg-[#BEE9E8]">
        <div className="zyro-atmosphere" />
        <div className="zyro-container flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#62B6CB]" />
            <p className="text-[#1B4965]/60 font-black uppercase tracking-widest text-[10px]">Synchronizing Nodes</p>
          </div>
        </div>
      </div>
    );
  }

  if (!claim) return null;

  const isPaid = claim.status === "PAID" || payoutSuccess;
  const isRejected = claim.status === "REJECTED";
  const canPayout = (claim.status === "ELIGIBLE" || claim.status === "PAYOUT_READY") && !payoutSuccess;

  return (
    <div className="zyro-root font-sans">
      <div className="zyro-atmosphere" />
      
      <div className="zyro-container Independent-scroll pb-32">
        <header className="px-6 pt-10 pb-4 flex items-center justify-between relative z-10">
           <button onClick={() => navigate("/dashboard")} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1B4965] shadow-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
           </button>
           <div className="text-right">
              <span className="text-[10px] font-black text-[#62B6CB] uppercase tracking-[0.2em]">Transaction ID</span>
              <p className="text-[12px] font-black text-[#1B4965] tracking-widest">{claim.claim_id.slice(0, 12).toUpperCase()}</p>
           </div>
        </header>

        <main className="px-6 space-y-6 relative z-10">
           
           {/* Status Banner */}
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[40px] p-8 border-2 shadow-2xl flex items-center justify-between relative overflow-hidden ${
              isPaid ? "bg-[#00FF87] border-[#00FF87] text-[#1B4965]" : "bg-white border-white text-[#1B4965]"
            }`}
           >
              <div className="space-y-1 relative z-10">
                 <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isPaid ? "text-[#1B4965]/40" : "text-[#62B6CB]"}`}>
                    Current Phase
                 </span>
                 <h2 className="text-3xl font-black italic uppercase tracking-tight leading-none">
                    {isPaid ? "Paid" : claim.status === 'REJECTED' ? "Rejected" : "Qualified"}
                 </h2>
              </div>
              <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-xl relative z-10 ${isPaid ? "bg-[#1B4965] text-[#00FF87]" : "bg-[#62B6CB] text-white"}`}>
                 {isPaid ? <Check size={32} strokeWidth={4} /> : <Shield size={32} />}
              </div>
              {isPaid && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
           </motion.div>

           {/* Financial Summary */}
           <div className="bg-[#1B4965] rounded-[40px] p-8 text-white shadow-2xl space-y-8">
              <div className="flex justify-between items-end">
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#62B6CB] uppercase tracking-[0.2em]">Benefit Amount</span>
                    <h3 className="text-[48px] font-black italic leading-none tracking-tighter text-[#00FF87]">₹{claim.final_payout}</h3>
                 </div>
                 <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Confidence</span>
                    <span className="text-sm font-black text-[#62B6CB]">{(claim.confidence_score * 100).toFixed(1)}%</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-1">Estimated Loss</span>
                    <span className="text-xl font-black italic">₹{claim.estimated_loss}</span>
                 </div>
                 <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-1">Protection %</span>
                    <span className="text-xl font-black italic">{(claim.protection_ratio * 100).toFixed(0)}%</span>
                 </div>
              </div>
           </div>

           {/* AI Explanation */}
           <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-6 border border-white shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                 <Zap size={14} className="text-[#62B6CB]" fill="currentColor" />
                 <span className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-widest italic">WIVE Logic Output</span>
              </div>
              <p className="text-[15px] font-bold text-[#1B4965]/80 italic leading-relaxed">
                 "{claim.explanation}"
              </p>
           </div>

           {/* Breakdown Sections */}
           <div className="space-y-3">
              <CollapsibleSection title="Trigger Details" icon={<CloudRain className="w-5 h-5" />} defaultOpen>
                 <div className="space-y-4 pt-2">
                    <DataRow label="Event Zone" value={claim.zone || "Anna Nagar"} />
                    <DataRow label="Severity" value={`${claim.severity_factor}x`} />
                    <DataRow label="Duration" value={`${claim.impact_reasoning?.event_duration_hours || 0} hrs`} />
                 </div>
              </CollapsibleSection>

              <CollapsibleSection title="WIVE Validation" icon={<ShieldCheck className="w-5 h-5 text-[#00FF87]" />}>
                 <div className="space-y-3 pt-2">
                    <CheckRow label="Active Policy Node" passed={claim.validation_breakdown?.policy_active} />
                    <CheckRow label="Parametric Match" passed={claim.validation_breakdown?.trigger_covered} />
                    <CheckRow label="Operating Zone Lock" passed={claim.validation_breakdown?.zone_match} />
                    <CheckRow label="Shift Window Overlap" passed={claim.validation_breakdown?.working_hours_overlap} />
                 </div>
              </CollapsibleSection>
           </div>

           {/* Snapshot Disclaimer */}
           <div className="p-6 bg-white/20 rounded-[32px] border border-[#1B4965]/5 flex gap-4 items-start">
              <Info size={18} className="text-[#1B4965]/40 mt-0.5 shrink-0" />
              <p className="text-[11px] text-[#1B4965]/60 font-bold leading-relaxed italic uppercase">
                 This is a deterministic settlement. Values were locked at the point of detection to ensure zero volatility for the partner.
              </p>
           </div>

        </main>
      </div>

      <StickyCTA className={payoutSuccess ? "hidden" : ""}>
         {canPayout ? (
           <Button onClick={handleExecutePayout} disabled={executing} className="h-16 rounded-[28px] shadow-2xl shadow-[#62B6CB]/20 flex items-center justify-center gap-3">
              {executing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Wallet size={20} />
                  <span>Execute Instant Payout</span>
                </>
              )}
           </Button>
         ) : (
           <Button onClick={() => navigate("/dashboard")} variant="secondary" className="h-16 rounded-[28px] border-[#1B4965]/10 text-[#1B4965]">
              Return to Command Center
           </Button>
         )}
      </StickyCTA>

      {/* Payout Success Modal */}
      <AnimatePresence>
        {payoutSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[110] bg-[#00FF87] flex flex-col items-center justify-center p-8 text-center"
          >
             <motion.div
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="space-y-10"
             >
                <div className="w-32 h-32 rounded-[40px] bg-[#1B4965] mx-auto flex items-center justify-center shadow-2xl">
                   <Check size={64} className="text-[#00FF87]" strokeWidth={4} />
                </div>
                <div className="space-y-3">
                   <h2 className="text-4xl font-black text-[#1B4965] italic uppercase tracking-tighter">Payout <br/>Executed</h2>
                   <p className="text-[#1B4965]/60 font-bold uppercase tracking-widest text-sm">₹{claim.final_payout} sent to UPI</p>
                </div>
                <div className="bg-white/20 p-6 rounded-[32px] border border-[#1B4965]/5">
                   <p className="text-[#1B4965] font-black text-xs uppercase tracking-widest">Balance Updated</p>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CollapsibleSection({ title, icon, children, defaultOpen = false }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-[32px] border border-white shadow-sm overflow-hidden">
       <button onClick={() => setIsOpen(!isOpen)} className="w-full px-6 py-5 flex items-center justify-between text-[#1B4965]">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-[#1B4965]/5 flex items-center justify-center text-[#62B6CB]">
                {icon}
             </div>
             <span className="text-sm font-black uppercase tracking-tight italic">{title}</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#1B4965]/20 transition-transform ${isOpen ? "rotate-180" : ""}`} />
       </button>
       <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
               <div className="px-6 pb-6 border-t border-[#1B4965]/5">
                  {children}
               </div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
}

function DataRow({ label, value }: any) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-widest">{label}</span>
       <span className="text-sm font-black text-[#1B4965] italic uppercase">{value}</span>
    </div>
  );
}

function CheckRow({ label, passed }: any) {
  return (
    <div className="flex items-center gap-3">
       <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${passed ? "bg-[#00FF87]/20 text-[#00FF87]" : "bg-[#FF6B35]/20 text-[#FF6B35]"}`}>
          {passed ? <Check size={12} strokeWidth={4} /> : <ShieldAlert size={12} />}
       </div>
       <span className={`text-[12px] font-bold ${passed ? "text-[#1B4965]" : "text-[#1B4965]/40"} uppercase tracking-tighter`}>{label}</span>
    </div>
  );
}
