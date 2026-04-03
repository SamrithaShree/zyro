import { useState, useEffect } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import { 
  ShieldCheck, 
  MapPin, 
  ShieldAlert, 
  AlertCircle, 
  ChevronRight, 
  Activity,
  History,
  Zap,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";
import { useAuthStore } from "../../store/useAuthStore";
import { policyService, PolicyInfo } from "../../services/policyService";
import { workerService, WorkerInfo } from "../../services/workerService";
import { Button } from "../components/ui/button";

/* ─────────────────────────────────────────
   Palette Usage (Phase 2)
   Background: #BEE9E8
   Interactive: #62B6CB
   Text: #1B4965
   Secondary: #5FA8D3
───────────────────────────────────────── */

export function Dashboard() {
  const { phone, workerId } = useAuthStore();
  const [profile, setProfile] = useState<WorkerInfo | null>(null);
  const [activePolicy, setActivePolicy] = useState<PolicyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profData, policyData] = await Promise.all([
          workerService.getMe(),
          policyService.getActivePolicy()
        ]);
        setProfile(profData);
        setActivePolicy(policyData);
      } catch (err) {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const policy = await policyService.activatePolicy();
      // Refetch after activation
      const policyInfo = await policyService.getActivePolicy();
      setActivePolicy(policyInfo);
    } catch {
       // handled
    } finally {
       setLoading(false);
    }
  };

  if (loading) {
    return (
      <MobileContainer style={{ backgroundColor: "#BEE9E8" }}>
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#62B6CB]" />
        </div>
        <BottomNav />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer hasBottomNav style={{ backgroundColor: "#BEE9E8" }}>
      <div className="px-8 pt-10 pb-24 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
             <span className="text-[10px] font-black text-[#62B6CB] uppercase tracking-widest">WORKER PROFILE</span>
             <h1 className="text-3xl font-black text-[#1B4965] tracking-tight">{workerId}</h1>
             <div className="flex items-center gap-1.5 text-[#1B4965]/60">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{profile?.zone}</span>
             </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex flex-col items-center justify-center border-2 border-[#62B6CB]/20">
             <span className="text-xs font-black text-[#62B6CB]">{profile?.trustScore}</span>
             <span className="text-[8px] font-bold text-[#1B4965]/40 uppercase tracking-tighter">TRUST</span>
          </div>
        </div>

        {/* Policy Status */}
        {activePolicy ? (
          <div className="bg-[#1B4965] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
             <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] font-black text-[#62B6CB] uppercase tracking-widest">ACTIVE PROTECTION</span>
                      </div>
                      <h2 className="text-4xl font-black tracking-tight">₹{activePolicy.premiumAmount} <span className="text-sm font-bold text-white/40">/ week</span></h2>
                   </div>
                   <ShieldCheck className="w-10 h-10 text-[#62B6CB]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">HOURLY BENEFIT</span>
                      <span className="text-xl font-black">₹{activePolicy.hourlyBenefit}</span>
                   </div>
                   <div className="bg-white/5 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">WEEKLY CAP</span>
                      <span className="text-xl font-black">₹{activePolicy.weeklyCap}</span>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                   <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-[#62B6CB]" />
                      <span className="text-xs font-medium text-white/60">Expires {new Date(activePolicy.validUntil).toLocaleDateString()}</span>
                   </div>
                   <button className="text-xs font-bold text-[#62B6CB]">View Policy</button>
                </div>
             </div>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] p-8 shadow-xl border-2 border-[#1B4965]/5 space-y-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#62B6CB]/10 flex items-center justify-center">
                   <ShieldAlert className="w-6 h-6 text-[#62B6CB]" />
                </div>
                <div>
                   <h3 className="font-black text-[#1B4965]">Unprotected</h3>
                   <p className="text-xs text-[#1B4965]/60">You don't have an active plan for this week.</p>
                </div>
             </div>
             <Button onClick={handleActivate} className="w-full h-14 rounded-2xl bg-[#62B6CB] text-white font-bold shadow-lg shadow-[#62B6CB]/20">
                Activate Protection
             </Button>
          </div>
        )}

        {/* Claim Awareness (Light) */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#1B4965] uppercase tracking-wider">Claim Pipeline</h3>
              <Zap className="w-4 h-4 text-[#62B6CB]" />
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-[24px] p-5 border border-[#1B4965]/5 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-[#1B4965]/5 flex items-center justify-center text-[#1B4965]">
                    <Activity className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-xs font-bold text-[#1B4965]">Automatic Monitoring</h4>
                    <p className="text-[10px] text-[#1B4965]/60">We track IMD weather and CPCB AQI data 24/7.</p>
                 </div>
                 <ChevronRight className="w-4 h-4 text-[#1B4965]/20" />
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-[24px] p-5 border border-[#1B4965]/5 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-[#1B4965]/5 flex items-center justify-center text-[#1B4965]">
                    <AlertCircle className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-xs font-bold text-[#1B4965]">Disruption Detectors</h4>
                    <p className="text-[10px] text-[#1B4965]/60">Zero claim filing required. Payouts are triggered by data.</p>
                 </div>
                 <ChevronRight className="w-4 h-4 text-[#1B4965]/20" />
              </div>
           </div>
        </div>

        {/* Trust & Activity */}
        <div className="bg-[#5FA8D3]/10 rounded-[32px] p-6 flex items-center gap-4 border border-[#5FA8D3]/20">
           <div className="flex-1">
              <span className="text-[10px] font-black text-[#5FA8D3] uppercase tracking-widest block mb-1">ACTIVITY STATE</span>
              <p className="text-sm font-bold text-[#1B4965]">Ready for disruption detection</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <div className="w-3 h-3 rounded-full bg-[#62B6CB] animate-ping" />
           </div>
        </div>

      </div>
      <BottomNav />
    </MobileContainer>
  );
}
