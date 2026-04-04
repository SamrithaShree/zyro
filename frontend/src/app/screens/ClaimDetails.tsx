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
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiService } from "../../services/api";
import { StepContainer } from "../../design-system/layouts/StepContainer";
import { StickyCTA } from "../../design-system/layouts/StickyCTA";
import { Button } from "../../design-system/components/Button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import "../../design-system/styles/atmosphere.css";

export function ClaimDetails() {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<string[]>(["event", "eligibility", "calculation"]);

  useEffect(() => {
    const fetchClaim = async () => {
      if (!claimId) return;
      try {
        const res = await apiService.claims.getClaim(claimId);
        if (res.data.status === "SUCCESS") {
          setClaim(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch claim", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaim();
  }, [claimId]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  if (loading) {
    return (
      <div className="zyro-root font-sans">
        <div className="zyro-atmosphere" />
        <div className="zyro-container flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#62B6CB]" />
            <p className="text-[#1B4965]/60 font-bold uppercase tracking-widest text-[10px]">Retrieving Claim Analysis</p>
          </div>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <StepContainer step={1} totalSteps={1} title="Claim Not Found" onBack={() => navigate("/dashboard")}>
        <div className="text-center py-20">
          <ShieldAlert className="w-16 h-16 text-[#FF6B35] mx-auto mb-4 opacity-20" />
          <p className="text-[#1B4965]/60 font-medium text-sm">This claim analysis might have expired or doesn't exist.</p>
        </div>
      </StepContainer>
    );
  }

  const isPaid = claim.status === "PAID" || claim.status === "PAYOUT_READY";
  const isRejected = claim.status === "REJECTED";

  return (
    <StepContainer 
      step={1} 
      totalSteps={1} 
      title="Claim Analysis"
      subtext={`ID: ${claim.claim_id.slice(0, 8).toUpperCase()}`}
      onBack={() => navigate("/dashboard")}
    >
      <div className="space-y-6 pb-24">
        
        {/* Main Status Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[32px] p-6 border-2 flex items-center justify-between shadow-sm backdrop-blur-md ${
            isPaid 
              ? "bg-[#00FF87]/5 border-[#00FF87]/20 text-[#00FF87]" 
              : isRejected 
              ? "bg-[#FF6B35]/5 border-[#FF6B35]/20 text-[#FF6B35]"
              : "bg-[#62B6CB]/5 border-[#62B6CB]/20 text-[#62B6CB]"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
              isPaid ? "bg-[#00FF87] text-[#1B4965]" : isRejected ? "bg-[#FF6B35] text-white" : "bg-[#62B6CB] text-white"
            }`}>
              {isPaid ? <ShieldCheck size={28} /> : isRejected ? <ShieldAlert size={28} /> : <Shield size={28} />}
            </div>
            <div>
              <div className="text-lg font-black italic uppercase tracking-tighter leading-tight">{claim.status}</div>
              <div className="text-[10px] font-bold opacity-60">
                {isPaid ? `Settled on ${new Date(claim.created_at).toLocaleDateString()}` : "Automated Detection"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black tracking-tighter italic text-[#1B4965]">₹{claim.final_payout}</div>
            <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">Payout</div>
          </div>
        </motion.div>

        {/* Automated Reasoning */}
        <div className="bg-white/40 backdrop-blur-md rounded-[28px] p-6 border border-white/60 space-y-4 shadow-sm">
           <div className="space-y-3">
              <div className="flex items-center gap-2">
                 <Zap className="w-4 h-4 text-[#62B6CB]" />
                 <h3 className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-widest">WIVE Logic Engine</h3>
              </div>
              <p className="text-sm font-medium text-[#1B4965]/80 leading-relaxed italic">
                 "{claim.explanation}"
              </p>
           </div>
           
           {claim.why_eligible && (
             <div className="pt-4 border-t border-[#1B4965]/5 space-y-2">
                <div className="flex items-center gap-2">
                   <CheckCircle2 className="w-4 h-4 text-[#62B6CB]" />
                   <h3 className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-widest">Eligibility Verdict</h3>
                </div>
                <p className="text-xs font-bold text-[#62B6CB]/80 leading-relaxed">
                   {claim.why_eligible}
                </p>
             </div>
           )}
        </div>

        {/* Breakdown Sections */}
        <div className="space-y-3">
          
          <CollapsibleSection
            id="event"
            title="Trigger Details"
            icon={<CloudRain className="w-5 h-5 text-[#62B6CB]" />}
            isOpen={openSections.includes("event")}
            onToggle={toggleSection}
          >
            <div className="space-y-4">
               <DataRow label="Event Zone" value={claim.validation_breakdown.zone_match ? "Verified Region" : "Outside Area"} />
               <DataRow label="Severity Factor" value={`${claim.severity_factor}x`} />
               <DataRow label="Disruption Duration" value={`${claim.impact_reasoning.event_duration_hours} hrs`} />
               <DataRow label="Zone" value={claim.zone || "Anna Nagar"} />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="eligibility"
            title="WIVE Verification"
            icon={<ShieldCheck className="w-5 h-5 text-[#00FF87]" />}
            isOpen={openSections.includes("eligibility")}
            onToggle={toggleSection}
          >
            <div className="space-y-3">
               <CheckRow label="Policy Active" passed={claim.validation_breakdown.policy_active} />
               <CheckRow label="Trigger Covered" passed={claim.validation_breakdown.trigger_covered} />
               <CheckRow label="Within Window" passed={claim.validation_breakdown.within_policy_window} />
               <CheckRow label="Hours Overlap" passed={claim.validation_breakdown.working_hours_overlap} />
               <CheckRow label="Intent Detected" passed={claim.validation_breakdown.earning_intent_detected} />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="calculation"
            title="Payout Formulation"
            icon={<TrendingDown className="w-5 h-5 text-[#FF6B35]" />}
            isOpen={openSections.includes("calculation")}
            onToggle={toggleSection}
          >
            <div className="space-y-4">
               <div className="bg-[#1B4965]/5 p-4 rounded-2xl space-y-3">
                  <DataRow label="Estimated Loss" value={`₹${claim.estimated_loss}`} />
                  <DataRow label="Protection Ratio" value={`${Math.round((claim.final_payout / claim.estimated_loss) * 100)}%`} />
                  <div className="h-px bg-[#1B4965]/5" />
                  <DataRow label="Uncovered (Self)" value={`₹${claim.estimated_loss - claim.final_payout}`} />
               </div>
               
               <div className="px-2 space-y-2">
                  <div className="text-[9px] font-black text-[#1B4965]/20 uppercase tracking-widest mb-2 text-center italic">Calibrated Formula</div>
                  <div className="text-center font-mono text-[10px] text-[#1B4965]/60 leading-relaxed">
                     (Hourly Benefit × Duration × Severity) <br/>
                     × Trust Multiplier ({claim.trust_multiplier_used})
                  </div>
               </div>
            </div>
          </CollapsibleSection>

        </div>

        {/* Snapshot Info */}
        <div className="p-5 bg-white/20 rounded-[24px] border border-white/40">
          <div className="flex gap-3">
            <Info size={16} className="text-[#1B4965]/40 mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#1B4965]/60 leading-relaxed font-medium">
              This payout analysis is a point-in-time snapshot. Final settlement values are locked at the time of detection to prevent volatility.
            </p>
          </div>
        </div>

      </div>

      <StickyCTA>
        <Button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </StickyCTA>
    </StepContainer>
  );
}

function CollapsibleSection({ id, title, icon, isOpen, onToggle, children }: any) {
  return (
    <div className="bg-white/20 rounded-[28px] border border-white/40 overflow-hidden">
      <button 
        onClick={() => onToggle(id)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center">
            {icon}
          </div>
          <span className="text-[14px] font-black text-[#1B4965] uppercase tracking-tight">{title}</span>
        </div>
        <ChevronDown size={18} className={`text-[#1B4965]/20 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-[#1B4965]/40 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-black text-[#1B4965] italic">{value}</span>
    </div>
  );
}

function CheckRow({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-md flex items-center justify-center ${passed ? "bg-[#00FF87]/20 text-[#00FF87]" : "bg-[#FF6B35]/20 text-[#FF6B35]"}`}>
        <span className="text-xs font-black">{passed ? "✓" : "×"}</span>
      </div>
      <span className={`text-sm font-bold ${passed ? "text-[#1B4965]/80" : "text-[#1B4965]/30"}`}>{label}</span>
    </div>
  );
}
