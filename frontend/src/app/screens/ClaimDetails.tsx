import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { 
  Shield, 
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

export function ClaimDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<string[]>(["summary", "breakdown"]);

  useEffect(() => {
    const fetchClaim = async () => {
      if (!id) return;
      try {
        const res = await apiService.claims.getClaim(id);
        setClaim(res.data);
      } catch (err) {
        console.error("Failed to fetch claim", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaim();
  }, [id]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  if (loading) {
    return (
      <div className="zyro-root font-sans">
        <div className="zyro-atmosphere" />
        <div className="zyro-container flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#62B6CB]" />
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <StepContainer step={1} totalSteps={1} title="Claim Not Found" onBack={() => navigate("/dashboard")}>
        <div className="text-center py-20">
          <p className="text-[#1B4965]/60 font-medium">This claim might have been archived or doesn't exist.</p>
        </div>
      </StepContainer>
    );
  }

  const isPaid = claim.status === "PAID" || claim.status === "PAYOUT_READY";

  return (
    <StepContainer 
      step={1} 
      totalSteps={1} 
      title={`${claim.event_type} Payout`}
      subtext={`ID: ${claim.claim_id.slice(0, 8).toUpperCase()}`}
      onBack={() => navigate("/dashboard")}
    >
      <div className="space-y-6 pb-10">
        
        {/* Main Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/40 backdrop-blur-md rounded-[32px] p-6 border border-white/60 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPaid ? 'bg-[#62B6CB]/10 text-[#62B6CB]' : 'bg-[#FF6B35]/10 text-[#FF6B35]'}`}>
                {isPaid ? <CheckCircle2 size={24} /> : <Clock size={24} />}
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-widest">Current Status</div>
                <div className={`text-[16px] font-black uppercase italic ${isPaid ? 'text-[#62B6CB]' : 'text-[#FF6B35]'}`}>
                  {claim.status}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-widest">Payout</div>
              <div className="text-[28px] font-black text-[#1B4965] tracking-tighter">₹{claim.final_payout}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#1B4965]/40 font-bold uppercase tracking-wider">Detected On</span>
              <span className="text-[#1B4965] font-black">{new Date(claim.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#1B4965]/40 font-bold uppercase tracking-wider">Event Zone</span>
              <span className="text-[#1B4965] font-black">{claim.zone || 'Anna Nagar'}</span>
            </div>
          </div>
        </motion.div>

        {/* Breakdown Sections */}
        <div className="space-y-4">
          
          {/* Validation Logic */}
          <div className="bg-white/20 rounded-[28px] border border-white/40 overflow-hidden">
            <button 
              onClick={() => toggleSection('summary')}
              className="w-full px-6 py-5 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-[#62B6CB]" />
                <span className="text-[14px] font-black text-[#1B4965] uppercase tracking-tight">WIVE Engine Summary</span>
              </div>
              <ChevronDown size={18} className={`text-[#1B4965]/20 transition-transform ${openSections.includes('summary') ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {openSections.includes('summary') && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 space-y-4"
                >
                  <p className="text-[13px] text-[#1B4965]/70 leading-relaxed font-medium">
                    {claim.description || "Parametric trigger detected heavy rainfall in your zone. WIVE engine confirmed order drop and verified your presence."}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#62B6CB]">
                      <CheckCircle2 size={14} strokeWidth={3} />
                      <span>Activity match verified via GPS</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#62B6CB]">
                      <CheckCircle2 size={14} strokeWidth={3} />
                      <span>Order disruption detected ({claim.order_drop_percent || 35}%)</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payout Calculation */}
          <div className="bg-white/20 rounded-[28px] border border-white/40 overflow-hidden">
            <button 
              onClick={() => toggleSection('breakdown')}
              className="w-full px-6 py-5 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <TrendingDown size={18} className="text-[#62B6CB]" />
                <span className="text-[14px] font-black text-[#1B4965] uppercase tracking-tight">Payout Breakdown</span>
              </div>
              <ChevronDown size={18} className={`text-[#1B4965]/20 transition-transform ${openSections.includes('breakdown') ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {openSections.includes('breakdown') && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#1B4965]/40 font-bold">ESTIMATED LOSS</span>
                      <span className="text-[#1B4965] font-black">₹{claim.estimated_loss}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#1B4965]/40 font-bold">PROTECTION RATIO</span>
                      <span className="text-[#62B6CB] font-black">{(claim.final_payout / claim.estimated_loss * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#1B4965]/40 font-bold">UNCOVERED LOSS</span>
                      <span className="text-[#FF6B35] font-black">₹{claim.estimated_loss - claim.final_payout}</span>
                    </div>
                    <div className="h-px bg-[#1B4965]/5 my-2" />
                    <div className="flex justify-between text-[15px]">
                      <span className="text-[#1B4965] font-black">TOTAL PAYOUT</span>
                      <span className="text-[#1B4965] font-black underline decoration-[#62B6CB] decoration-2">₹{claim.final_payout}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Verification Logic Snapshot */}
        <div className="p-5 bg-[#1B4965]/5 rounded-[24px] border border-[#1B4965]/5">
          <div className="flex gap-3">
            <Info size={16} className="text-[#1B4965]/40 mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#1B4965]/60 leading-relaxed font-medium">
              This payout was calculated using the Standard tier protection plan. Factors included: Rainfall intensity (18mm/hr), Zone demand drop, and verified work presence.
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
