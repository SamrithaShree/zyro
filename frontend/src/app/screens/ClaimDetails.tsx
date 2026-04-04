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
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiService } from "../../services/api";
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
  const [openSections, setOpenSections] = useState<string[]>(["event", "eligibility"]);

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
    const interval = setInterval(fetchClaim, 3000);
    return () => clearInterval(interval);
  }, [claimId]);

  useEffect(() => {
    if (claim?.status === "PAID" && !payoutSuccess) {
      setPayoutSuccess(true);
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
      <div className="zyro-root font-sans">
        <div className="zyro-atmosphere" />
        <div className="zyro-container flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#62B6CB]" />
            <p className="text-[#1B4965]/40 font-bold uppercase tracking-widest text-[10px]">Verifying Nodes</p>
          </div>
        </div>
      </div>
    );
  }

  if (!claim) return null;

  const isPaid = claim.status === "PAID" || payoutSuccess;
  const canPayout = (claim.status === "ELIGIBLE" || claim.status === "PAYOUT_READY") && !payoutSuccess;

  return (
    <div className="zyro-root font-sans">
      <div className="zyro-atmosphere" />
      
      <div className="zyro-container Independent-scroll pb-32">
        <header className="px-6 pt-10 pb-4 flex items-center justify-between relative z-10">
           <button onClick={() => navigate("/dashboard")} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1B4965] shadow-lg">
              <ArrowLeft size={20} />
           </button>
           <div className="text-right">
              <span className="text-[10px] font-bold text-[#62B6CB] uppercase tracking-[0.2em]">Resolution</span>
              <p className="text-[12px] font-black text-[#1B4965] tracking-widest uppercase">Determinism Locked</p>
           </div>
        </header>

        <main className="px-6 space-y-6 relative z-10">
           
           {/* Phase Banner */}
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[32px] p-6 border-2 shadow-sm flex items-center justify-between ${
              isPaid ? "bg-[#00FF87] border-[#00FF87] text-[#1B4965]" : "bg-white border-white text-[#1B4965]"
            }`}
           >
              <div className="space-y-1">
                 <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isPaid ? "opacity-40" : "text-[#62B6CB]"}`}>
                    Current State
                 </span>
                 <h2 className="text-2xl font-black italic uppercase leading-none">
                    {isPaid ? "Payout Complete" : "Qualified"}
                 </h2>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${isPaid ? "bg-[#1B4965] text-[#00FF87]" : "bg-[#62B6CB] text-white"}`}>
                 {isPaid ? <Check size={24} strokeWidth={4} /> : <Shield size={24} />}
              </div>
           </motion.div>

           {/* Amount Card */}
           <div className="bg-[#1B4965] rounded-[40px] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#62B6CB]/10 rounded-full blur-3xl" />
              <div className="relative z-10 flex justify-between items-end">
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#62B6CB] uppercase tracking-[0.2em]">Benefit Payout</span>
                    <h3 className="text-[48px] font-black italic leading-none tracking-tighter text-[#00FF87]">₹{claim.final_payout}</h3>
                 </div>
                 <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block leading-none mb-1">WIVE Confidence</span>
                    <span className="text-sm font-black text-[#62B6CB]">{(claim.confidence_score * 100).toFixed(1)}%</span>
                 </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-1">Estimated Loss</span>
                    <span className="text-xl font-bold">₹{claim.estimated_loss}</span>
                 </div>
                 <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-1">Replacement</span>
                    <span className="text-xl font-bold">{(claim.protection_ratio * 100).toFixed(0)}%</span>
                 </div>
              </div>
           </div>

           {/* AI reasoning */}
           <div className="bg-white/40 backdrop-blur-md rounded-[28px] p-6 border border-white/60 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                 <Zap size={14} className="text-[#62B6CB]" fill="currentColor" />
                 <span className="text-[10px] font-bold text-[#1B4965]/60 uppercase tracking-widest italic">WIVE Analysis Result</span>
              </div>
              <p className="text-[14px] font-bold text-[#1B4965] italic leading-relaxed opacity-80">
                 "{claim.explanation}"
              </p>
           </div>

           {/* Collapsible Details */}
           <div className="space-y-3">
              <CollapsibleRow title="Disruption Details" icon={<CloudRain size={18} />} isOpen={openSections.includes('event')} onClick={() => toggleSection('event')}>
                 <div className="space-y-3 pt-3">
                    <DataPoint label="Primary Node" value={claim.zone || "Anna Nagar"} />
                    <DataPoint label="Severity Node" value={`${claim.severity_factor}x Impact`} />
                    <DataPoint label="Duration Locked" value={`${claim.impact_reasoning?.event_duration_hours || 4} hrs`} />
                 </div>
              </CollapsibleRow>

              <CollapsibleRow title="WIVE Validation" icon={<ShieldCheck size={18} className="text-[#00FF87]" />} isOpen={openSections.includes('eligibility')} onClick={() => toggleSection('eligibility')}>
                 <div className="space-y-2 pt-3">
                    <CheckPoint label="Contract Active" passed={claim.validation_breakdown?.policy_active} />
                    <CheckPoint label="Parametric Coverage Match" passed={claim.validation_breakdown?.trigger_covered} />
                    <CheckPoint label="Operating Zone Handshake" passed={claim.validation_breakdown?.zone_match} />
                    <CheckPoint label="Earning Intent Overlap" passed={claim.validation_breakdown?.working_hours_overlap} />
                 </div>
              </CollapsibleRow>
           </div>

        </main>
      </div>

      {!isPaid && (
        <StickyCTA>
           {canPayout ? (
             <Button onClick={handleExecutePayout} disabled={executing} className="h-16 rounded-[24px] shadow-xl flex items-center justify-center gap-3">
                {executing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Wallet size={20} />
                    <span>Authorize Instant Payout</span>
                  </>
                )}
             </Button>
           ) : (
             <Button onClick={() => navigate("/dashboard")} variant="secondary" className="h-16 rounded-[24px]">
                Return to Dashboard
             </Button>
           )}
        </StickyCTA>
      )}

      {/* Payout Modal */}
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
               className="space-y-8"
             >
                <div className="w-28 h-28 rounded-[40px] bg-[#1B4965] mx-auto flex items-center justify-center shadow-2xl">
                   <Check size={56} className="text-[#00FF87]" strokeWidth={4} />
                </div>
                <div className="space-y-2">
                   <h2 className="text-3xl font-black text-[#1B4965] italic uppercase tracking-tighter">Paid instantly</h2>
                   <p className="text-[#1B4965]/60 font-bold uppercase tracking-widest text-xs">₹{claim.final_payout} transferred to UPI</p>
                </div>
                <Button onClick={() => navigate("/dashboard")} variant="secondary" className="bg-[#1B4965] text-white border-none h-14 rounded-2xl font-bold uppercase">
                   Done
                </Button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  function toggleSection(s: string) {
    setOpenSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }
}

function CollapsibleRow({ title, icon, children, isOpen, onClick }: any) {
  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-[28px] border border-white/60 overflow-hidden">
       <button onClick={onClick} className="w-full px-6 py-5 flex items-center justify-between text-[#1B4965]">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#62B6CB] shadow-sm">
                {icon}
             </div>
             <span className="text-[15px] font-bold uppercase tracking-tight italic">{title}</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#1B4965]/20 transition-transform ${isOpen ? "rotate-180" : ""}`} />
       </button>
       <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
               <div className="px-6 pb-6 border-t border-white/20">
                  {children}
               </div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
}

function DataPoint({ label, value }: any) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-widest">{label}</span>
       <span className="text-[13px] font-bold text-[#1B4965] italic uppercase">{value}</span>
    </div>
  );
}

function CheckPoint({ label, passed }: any) {
  return (
    <div className="flex items-center gap-3">
       <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${passed ? "bg-green-500/20 text-green-600" : "bg-[#FF6B35]/20 text-[#FF6B35]"}`}>
          {passed ? <Check size={12} strokeWidth={4} /> : <ShieldAlert size={12} />}
       </div>
       <span className={`text-[12px] font-bold ${passed ? "text-[#1B4965]" : "text-[#1B4965]/40"} uppercase tracking-tighter`}>{label}</span>
    </div>
  );
}
