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
  TrendingDown,
  AlertCircle,
  Wallet,
  BarChart3,
  ArrowUpRight,
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

  const fetchData = async () => {
    try {
      const [profRes, policyRes, claimsRes] = await Promise.all([
        apiService.worker.getMe(),
        apiService.policy.getStatus(),
        apiService.claims.getMyClaims(),
      ]);

      if (profRes.data.status === "SUCCESS") {
        setProfile(profRes.data.data);
      } else {
        setProfile({ phone, zone: "Anna Nagar", city: "Chennai" });
      }

      if (policyRes.data) {
        setPolicyStatus(policyRes.data);
      }

      if (Array.isArray(claimsRes.data)) {
        setClaims(claimsRes.data);
      }
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [phone]);

  if (loading) {
    return (
      <div className="zyro-root font-sans">
        <div className="zyro-atmosphere" />
        <div className="zyro-container flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#62B6CB]" />
            <p className="text-[#1B4965]/40 font-black uppercase tracking-widest text-[10px]">Authorizing Session</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const hasPolicy = policyStatus?.has_active_policy;
  const policy = policyStatus?.policy_details;

  // ── Financial computations ──
  const paidClaims = claims.filter((c) => c.status === "PAID");
  const totalClaimed = paidClaims.reduce((sum, c) => sum + (c.final_payout || 0), 0);
  const totalEstimatedLoss = paidClaims.reduce((sum, c) => sum + (c.estimated_loss || 0), 0);
  const netGain = totalClaimed - totalEstimatedLoss;
  const remainingCap = policyStatus?.remaining_cap ?? (policy?.weekly_cap ?? 0);
  const weeklyCap = policy?.weekly_cap ?? 0;
  const usedPct = weeklyCap > 0 ? Math.min(100, ((weeklyCap - remainingCap) / weeklyCap) * 100) : 0;

  return (
    <div className="zyro-root font-sans">
      <div className="zyro-atmosphere" />

      <div className="zyro-container pb-32">
        {/* ── Top Header ── */}
        <header className="px-6 pt-10 pb-4 flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${hasPolicy ? "bg-[#62B6CB]" : "bg-[#FF6B35]"}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${hasPolicy ? "text-[#62B6CB]" : "text-[#FF6B35]"}`}>
                {hasPolicy ? "Online & Protected" : "Online · Unprotected"}
              </span>
            </div>
            <h1 className="text-[28px] font-black text-[#1B4965] tracking-tight italic uppercase leading-none">
              {profile?.name?.split(" ")[0] || name || "Partner"}
            </h1>
            <div className="flex items-center gap-1.5 text-[#1B4965]/40">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-[12px] font-bold uppercase tracking-tighter">
                {profile?.city || "Chennai"} • {profile?.zone || "Anna Nagar"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/simulate")}
              className="w-14 h-14 rounded-2xl bg-white border-2 border-white shadow-xl flex items-center justify-center cursor-pointer text-[#62B6CB]"
            >
              <Zap className="w-7 h-7 fill-[#62B6CB]" />
            </motion.div>

            <motion.div
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/profile")}
              className="w-14 h-14 rounded-2xl bg-[#1B4965] flex flex-col items-center justify-center shadow-xl border border-[#1B4965]/10 cursor-pointer"
            >
              <span className="text-[18px] font-black text-[#62B6CB] leading-none">98</span>
              <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter mt-1">TRUST</span>
            </motion.div>
          </div>
        </header>

        <main className="px-6 space-y-6 relative z-10">

          {/* ── Financial Summary Strip ── */}
          {hasPolicy && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h3 className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.3em] px-2">Financial Snapshot</h3>

              {/* Row 1: Balance + Total Claimed */}
              <div className="grid grid-cols-2 gap-3">
                {/* Balance Remaining */}
                <div className="bg-[#1B4965] rounded-[28px] p-5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#62B6CB]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Wallet className="w-3.5 h-3.5 text-[#62B6CB]" />
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Balance</span>
                    </div>
                    <div className="text-[28px] font-black text-[#62B6CB] italic leading-none tracking-tighter">
                      ₹{remainingCap}
                    </div>
                    <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider mt-1">
                      of ₹{weeklyCap} cap
                    </div>
                    {/* Usage bar */}
                    <div className="h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${usedPct}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-[#62B6CB] rounded-full"
                      />
                    </div>
                    <div className="text-[8px] text-white/20 font-bold uppercase mt-1">{usedPct.toFixed(0)}% used</div>
                  </div>
                </div>

                {/* Total Claimed */}
                <div className="bg-white rounded-[28px] p-5 shadow-xl border border-white/60 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#00FF87]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-3">
                      <BarChart3 className="w-3.5 h-3.5 text-[#1B4965]/40" />
                      <span className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-widest">Claimed</span>
                    </div>
                    <div className="text-[28px] font-black text-[#1B4965] italic leading-none tracking-tighter">
                      ₹{totalClaimed}
                    </div>
                    <div className="text-[9px] font-bold text-[#1B4965]/30 uppercase tracking-wider mt-1">
                      {paidClaims.length} payout{paidClaims.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Net Gain vs Estimated Loss */}
              <div className="bg-white rounded-[32px] p-6 shadow-xl border border-white/60">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.2em]">Income Protection View</span>
                  <ArrowUpRight className="w-4 h-4 text-[#62B6CB]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingDown className="w-3.5 h-3.5 text-[#FF6B35]" />
                      <span className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-wider">Est. Loss</span>
                    </div>
                    <div className="text-[22px] font-black text-[#FF6B35] italic tracking-tighter leading-none">
                      ₹{totalEstimatedLoss}
                    </div>
                    <div className="text-[9px] text-[#1B4965]/30 font-bold uppercase mt-0.5">without zyro</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-[#00FF87]" />
                      <span className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-wider">Net Gain</span>
                    </div>
                    <div className={`text-[22px] font-black italic tracking-tighter leading-none ${netGain >= 0 ? "text-[#00CC6B]" : "text-[#FF6B35]"}`}>
                      {netGain >= 0 ? "+" : ""}₹{netGain}
                    </div>
                    <div className="text-[9px] text-[#1B4965]/30 font-bold uppercase mt-0.5">protected income</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Policy Hero Card ── */}
          {hasPolicy ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1B4965] rounded-[40px] p-8 text-white shadow-[0_30px_60px_rgba(27,73,101,0.3)] relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#62B6CB]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700" />

              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#62B6CB] uppercase tracking-[0.2em] italic">
                      {policy?.tier} PROTECTION
                    </span>
                    <div className="flex items-baseline gap-1">
                      <h2 className="text-[42px] font-black text-white tracking-tighter italic leading-none">
                        ₹{policy?.premium_amount}
                      </h2>
                      <span className="text-[14px] font-bold text-white/30">/wk</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[#62B6CB] shadow-inner">
                    <ShieldCheck size={28} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm p-5 rounded-[24px] border border-white/5">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-wider block mb-1">Hourly Rate</span>
                    <span className="text-2xl font-black italic">₹{policy?.hourly_benefit}</span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm p-5 rounded-[24px] border border-white/5">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-wider block mb-1">Weekly Pool</span>
                    <span className="text-2xl font-black italic text-[#62B6CB]">
                      ₹{remainingCap}{" "}
                      <span className="text-[10px] text-white/20">/ {weeklyCap}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#62B6CB]" />
                    <span className="text-[10px] font-bold text-white/40 tracking-tight uppercase">
                      Window: {policyStatus?.coverage_window}
                    </span>
                  </div>
                  <button className="text-[10px] font-black text-[#62B6CB] uppercase tracking-widest hover:text-white transition-colors underline underline-offset-4 decoration-2">
                    Full Contract
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] p-10 border-2 border-dashed border-[#1B4965]/10 shadow-2xl space-y-8 text-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-[28px] bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] shadow-inner">
                  <ShieldAlert size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1B4965] italic tracking-tight uppercase">Unprotected</h3>
                  <p className="text-[15px] text-[#1B4965]/60 font-medium leading-relaxed max-w-[200px] mx-auto">
                    Your earning intent is currently at risk.
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate("/onboarding")} className="w-full h-16 rounded-2xl font-black text-lg uppercase shadow-xl shadow-[#62B6CB]/20">
                Activate Protection
              </Button>
            </motion.div>
          )}

          {/* ── Active Payouts (Claims) ── */}
          <div className="space-y-6 pb-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[12px] font-black text-[#1B4965]/40 uppercase tracking-[0.3em]">Active Payouts</h3>
              <button
                onClick={() => navigate("/activity")}
                className="text-[10px] font-black text-[#62B6CB] uppercase tracking-widest flex items-center gap-1"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {claims.length > 0 ? (
                claims.slice(0, 3).map((claim, i) => (
                  <motion.div
                    key={claim.claim_id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(`/claim-details/${claim.claim_id}`)}
                    className="bg-white rounded-[32px] p-6 shadow-xl border border-white flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                          claim.status === "PAID"
                            ? "bg-[#00FF87]/10 text-[#00FF87]"
                            : "bg-[#62B6CB]/10 text-[#62B6CB]"
                        }`}
                      >
                        {claim.status === "PAID" ? (
                          <ShieldCheck className="w-6 h-6" />
                        ) : (
                          <AlertCircle className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-[16px] font-black text-[#1B4965] italic leading-tight">
                          {claim.status === "PAID" ? "Payout Success" : "Loss Detected"}
                        </h4>
                        <p className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-widest mt-0.5">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="text-lg font-black text-[#1B4965] italic">₹{claim.final_payout}</div>
                        <div
                          className={`text-[9px] font-black uppercase tracking-tighter ${
                            claim.status === "PAID" ? "text-[#00FF87]" : "text-[#62B6CB]"
                          }`}
                        >
                          {claim.status}
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-[#1B4965]/10 group-hover:text-[#62B6CB] transition-colors" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-[#1B4965]/5 rounded-[40px] p-12 border-2 border-dashed border-[#1B4965]/10 text-center">
                  <div className="w-16 h-16 rounded-[24px] bg-[#1B4965]/5 flex items-center justify-center mx-auto mb-6 text-[#1B4965]/20">
                    <Activity size={32} />
                  </div>
                  <p className="text-[12px] text-[#1B4965]/40 font-black uppercase tracking-[0.2em] mb-1">Monitoring Zone</p>
                  <p className="text-[13px] text-[#1B4965]/30 font-medium max-w-[180px] mx-auto leading-relaxed">
                    No disruptions detected in your shift window yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── System Status ── */}
          <div className="bg-white/40 backdrop-blur-xl rounded-[32px] py-6 px-8 flex items-center justify-between shadow-sm border border-white/60">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-[#62B6CB] shadow-[0_0_15px_#62B6CB] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[12px] font-black text-[#1B4965] uppercase tracking-wider">WIVE AI Engine Active</span>
                <span className="text-[9px] font-bold text-[#1B4965]/40 uppercase tracking-widest">Real-time Node Monitoring</span>
              </div>
            </div>
            <span className="text-[10px] font-black text-[#62B6CB] uppercase">100% Uptime</span>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
