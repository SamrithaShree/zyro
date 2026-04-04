import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  ShieldCheck, 
  MapPin, 
  ShieldAlert, 
  Activity,
  History,
  Zap,
  Loader2,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Plus,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../../store/useAuthStore";
import { apiService } from "../../services/api";
import { Button } from "../../design-system/components/Button";
import { BottomNav } from "../components/BottomNav";
import "../../design-system/styles/atmosphere.css";

export function Dashboard() {
  const navigate = useNavigate();
  const { workerId, name, phone } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [policyStatus, setPolicyStatus] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, policyRes, claimsRes] = await Promise.all([
          apiService.worker.getMe(),
          apiService.policy.getStatus(),
          apiService.claims.getMyClaims()
        ]);
        
        if (profRes.data.status === "SUCCESS") {
          setProfile(profRes.data.data);
        } else {
          // Fallback if worker not fully created but we have phone
          setProfile({ phone, zone: "Anna Nagar" });
        }

        if (policyRes.data.status === "SUCCESS") {
          setPolicyStatus(policyRes.data.data);
        }

        if (claimsRes.data.status === "SUCCESS") {
          setClaims(claimsRes.data.data);
        }
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [phone]);

  if (loading) {
    return (
      <div className="zyro-root font-sans bg-[#1B4965]">
        <div className="zyro-atmosphere" />
        <div className="zyro-container flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#62B6CB]" />
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Syncing Dashboard</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const hasPolicy = policyStatus?.has_active_policy;
  const policy = policyStatus?.policy_details;

  return (
    <div className="zyro-root font-sans">
      <div className="zyro-atmosphere" />
      
      <div className="zyro-container pb-32">
        {/* Top Header */}
        <header className="px-6 pt-10 pb-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${hasPolicy ? 'bg-[#62B6CB]' : 'bg-[#FF6B35]'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${hasPolicy ? 'text-[#62B6CB]' : 'text-[#FF6B35]'}`}>
                {hasPolicy ? 'Online & Protected' : 'Online · Unprotected'}
              </span>
            </div>
            <h1 className="text-[28px] font-black text-[#1B4965] tracking-tight">
              Hey, {profile?.name || name || 'Partner'}
            </h1>
            <div className="flex items-center gap-1.5 text-[#1B4965]/40">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-[12px] font-bold">{profile?.city || 'Chennai'} • {profile?.zone || 'Anna Nagar'}</span>
            </div>
          </div>
          
          <motion.div 
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/profile")}
            className="w-14 h-14 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 flex flex-col items-center justify-center shadow-sm cursor-pointer"
          >
            <span className="text-[18px] font-black text-[#62B6CB] leading-none">{profile?.trustScore || '98'}</span>
            <span className="text-[8px] font-black text-[#1B4965]/40 uppercase tracking-tighter mt-1">TRUST</span>
          </motion.div>
        </header>

        <main className="px-6 space-y-8">
          
          {/* Policy Hero Card */}
          {hasPolicy ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#BEE9E8] rounded-[40px] p-8 text-[#1B4965] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#62B6CB]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700" />
              
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.2em]">{policy?.tier} Coverage</span>
                    <div className="flex items-baseline gap-1">
                      <h2 className="text-[42px] font-black text-[#1B4965] tracking-tighter italic leading-none">₹{policy?.premium_amount}</h2>
                      <span className="text-[14px] font-bold text-[#1B4965]/30">/wk</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-[#1B4965] flex items-center justify-center text-[#BEE9E8] shadow-xl">
                    <ShieldCheck size={28} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1B4965]/5 backdrop-blur-sm p-5 rounded-[24px] border border-[#1B4965]/10">
                    <span className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-wider block mb-1">Benefit/Hr</span>
                    <span className="text-2xl font-black italic">₹{policy?.hourly_benefit}</span>
                  </div>
                  <div className="bg-[#1B4965]/5 backdrop-blur-sm p-5 rounded-[24px] border border-[#1B4965]/10">
                    <span className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-wider block mb-1">Remaining</span>
                    <span className="text-2xl font-black italic">₹{policyStatus?.remaining_cap}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[#1B4965]/10">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 opacity-40" />
                    <span className="text-[10px] font-bold opacity-60">Window: {policyStatus?.coverage_window}</span>
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
              className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 border border-white/60 shadow-[0_8px_30px_rgba(27,73,101,0.05)] space-y-8"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35]">
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <h3 className="text-[20px] font-black text-[#1B4965] italic tracking-tight">Unprotected</h3>
                  <p className="text-[14px] text-[#1B4965]/60 font-medium leading-tight">Your income is at risk today. Activate protection to earn safely.</p>
                </div>
              </div>
              <Button onClick={() => navigate("/onboarding")} className="w-full h-14 rounded-2xl font-bold text-base">
                Activate Protection
              </Button>
            </motion.div>
          )}

          {/* Claims History */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[12px] font-bold text-[#1B4965]/40 uppercase tracking-[0.2em]">Active Payouts</h3>
              <TrendingUp className="w-4 h-4 text-[#62B6CB]" />
            </div>
            
            <div className="space-y-4">
              {claims.length > 0 ? (
                claims.map((claim, i) => (
                  <motion.div 
                    key={claim.claim_id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(`/claim-details/${claim.claim_id}`)}
                    className="bg-white/40 backdrop-blur-sm rounded-[28px] p-6 border border-white/60 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        claim.status === 'PAID' ? 'bg-green-500/20 text-green-500' : 'bg-[#62B6CB]/20 text-[#62B6CB]'
                      }`}>
                        {claim.status === 'PAID' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1B4965]">{claim.status === 'PAID' ? 'Payout Sent' : 'Eligibility Detected'}</h4>
                        <p className="text-[10px] text-[#1B4965]/40">{new Date(claim.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="text-sm font-black text-[#1B4965]">₹{claim.final_payout}</div>
                        <div className="text-[9px] font-bold text-[#1B4965]/20 uppercase tracking-tighter">{claim.status}</div>
                      </div>
                      <ChevronRight size={18} className="text-[#1B4965]/20" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white/20 rounded-[28px] p-8 border border-white/40 border-dashed text-center">
                  <div className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center mx-auto mb-4 text-[#1B4965]/20">
                    <Activity size={24} />
                  </div>
                  <p className="text-[14px] text-[#1B4965]/40 font-bold uppercase tracking-widest">No claims yet</p>
                  <p className="text-[12px] text-[#1B4965]/30 font-medium">Payouts trigger automatically during heat or rain.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats / Info */}
          <div className="bg-[#62B6CB]/10 rounded-[32px] py-5 px-6 flex items-center justify-between border border-[#62B6CB]/20">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#62B6CB] shadow-[0_0_10px_#62B6CB]" />
              <span className="text-[12px] font-black text-[#1B4965]/80 uppercase tracking-wider">WIVE AI Detection Online</span>
            </div>
            <span className="text-[10px] font-bold text-[#62B6CB] uppercase">100% Uptime</span>
          </div>

        </main>
      </div>
      
      <BottomNav />
    </div>
  );
}
