import { useState, useEffect } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import { 
  ShieldCheck, 
  MapPin, 
  ShieldAlert, 
  Activity,
  History,
  Zap,
  Loader2,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { motion } from "motion/react";
import { useAuthStore } from "../../store/useAuthStore";
import { policyService, PolicyInfo } from "../../services/policyService";
import { workerService, WorkerInfo } from "../../services/workerService";
import { Button } from "../components/ui/button";

export function Dashboard() {
  const { workerId } = useAuthStore();
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
      await policyService.activatePolicy();
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
      <MobileContainer className="bg-[#1B4965]">
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-[#62B6CB]" />
          <p className="mt-4 text-white/40 font-bold uppercase tracking-widest text-[10px]">Loading Profile</p>
        </div>
        <BottomNav />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer hasBottomNav className="bg-[#1B4965]">
      <div className="px-6 pt-12 pb-32 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#62B6CB] animate-pulse" />
                <span className="text-[10px] font-black text-[#62B6CB] uppercase tracking-widest">Online & Protected</span>
             </div>
             <h1 className="text-3xl font-black text-white tracking-tight">{workerId}</h1>
             <div className="flex items-center gap-1.5 text-white/40">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{profile?.zone || "Koramangala, BLR"}</span>
             </div>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center shadow-2xl"
          >
             <span className="text-xl font-black text-[#62B6CB] leading-none">{profile?.trustScore || "98"}</span>
             <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter mt-1">TRUST</span>
          </motion.div>
        </div>

        {/* Policy Status - The Hero Element */}
        {activePolicy ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#BEE9E8] rounded-[40px] p-8 text-[#1B4965] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 w-48 h-48 bg-[#62B6CB]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700" />
             
             <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <span className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.2em]">Active Coverage</span>
                      <h2 className="text-5xl font-black tracking-tighter italic">₹{activePolicy.premiumAmount}</h2>
                      <p className="text-xs font-bold text-[#1B4965]/60">Weekly Premium Plan</p>
                   </div>
                   <div className="w-14 h-14 rounded-2xl bg-[#1B4965] flex items-center justify-center text-[#BEE9E8] shadow-xl">
                      <ShieldCheck className="w-8 h-8" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-[#1B4965]/5 backdrop-blur-sm p-5 rounded-[24px] border border-[#1B4965]/10">
                      <span className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-wider block mb-1">Benefit/Hr</span>
                      <span className="text-2xl font-black italic">₹{activePolicy.hourlyBenefit}</span>
                   </div>
                   <div className="bg-[#1B4965]/5 backdrop-blur-sm p-5 rounded-[24px] border border-[#1B4965]/10">
                      <span className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-wider block mb-1">Max Payout</span>
                      <span className="text-2xl font-black italic">₹{activePolicy.weeklyCap}</span>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[#1B4965]/10">
                   <div className="flex items-center gap-2">
                      <History className="w-4 h-4 opacity-40" />
                      <span className="text-[10px] font-bold opacity-60">Expires {new Date(activePolicy.validUntil).toLocaleDateString()}</span>
                   </div>
                   <button className="text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                      Policy Details
                   </button>
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-[40px] p-8 border border-white/10 space-y-8"
          >
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#62B6CB]/20 flex items-center justify-center text-[#62B6CB]">
                   <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white italic">Unprotected</h3>
                   <p className="text-sm text-white/40 font-medium">Your income is at risk today.</p>
                </div>
             </div>
             <Button onClick={handleActivate} variant="gradient" size="lg" className="w-full">
                Activate Protection
             </Button>
          </motion.div>
        )}

        {/* Claim Awareness Section */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Real-time Triggers</h3>
              <TrendingUp className="w-4 h-4 text-[#62B6CB]" />
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              {[
                { 
                  icon: <Activity className="w-5 h-5" />, 
                  title: "Weather Monitoring", 
                  desc: "Tracking IMD heat & rain alerts" 
                },
                { 
                  icon: <Zap className="w-5 h-5" />, 
                  title: "Smart Detection", 
                  desc: "Payouts trigger without paperwork" 
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-[28px] p-6 border border-white/10 flex items-center gap-5 group hover:bg-white/10 transition-colors"
                >
                   <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#62B6CB] group-hover:scale-110 transition-transform">
                      {item.icon}
                   </div>
                   <div className="flex-1">
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-[10px] text-white/40 font-medium">{item.desc}</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                </motion.div>
              ))}
           </div>
        </div>

        {/* Bottom Status Badge */}
        <div className="bg-[#62B6CB]/10 rounded-full py-4 px-6 flex items-center justify-between border border-[#62B6CB]/20">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#62B6CB] shadow-[0_0_10px_#62B6CB]" />
              <span className="text-xs font-black text-white/80 uppercase tracking-wider">System Operational</span>
           </div>
           <span className="text-[10px] font-bold text-[#62B6CB]">100% Uptime</span>
        </div>

      </div>
      <BottomNav />
    </MobileContainer>
  );
}
