import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import {
  User,
  MapPin,
  Wallet,
  Shield,
  ChevronRight,
  LogOut,
  Star,
  Settings,
  ShieldCheck,
  BarChart3,
  Loader2,
  Phone,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { apiService } from "../../services/api";
import { motion } from "motion/react";
import "../../design-system/styles/atmosphere.css";

export function Profile() {
  const navigate = useNavigate();
  const { phone, trustScore, logout: authLogout } = useAuthStore();
  const { data, reset: onboardingReset } = useOnboardingStore();

  const [policyStatus, setPolicyStatus] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [policyRes, claimsRes] = await Promise.all([
          apiService.policy.getStatus(),
          apiService.claims.getMyClaims(),
        ]);
        if (policyRes.data) setPolicyStatus(policyRes.data);
        if (Array.isArray(claimsRes.data)) setClaims(claimsRes.data);
      } catch (err) {
        console.error("Profile fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await apiService.auth.logout();
    } catch {
      // Ignore
    } finally {
      authLogout();
      onboardingReset();
      navigate("/login");
    }
  };

  const paidClaims = claims.filter((c) => c.status === "PAID");
  const totalClaimed = paidClaims.reduce((s, c) => s + (c.final_payout || 0), 0);
  const hasPolicy = policyStatus?.has_active_policy;
  const policy = policyStatus?.policy_details;

  const score = trustScore ?? 98;

  return (
    <div className="zyro-root font-sans">
      <div className="zyro-atmosphere" />

      <div className="zyro-container pb-32">
        <div className="px-6 pt-12 pb-8 space-y-8 relative z-10">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-[28px] font-black text-[#1B4965] tracking-tight italic uppercase leading-none">Profile</h1>
              <p className="text-[10px] font-black text-[#62B6CB] uppercase tracking-[0.3em]">Account Overview</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xl border border-white/60 flex items-center justify-center text-[#62B6CB]">
              <Settings className="w-6 h-6" />
            </div>
          </div>

          {/* ── Identity Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1B4965] rounded-[40px] p-8 text-white shadow-[0_30px_60px_rgba(27,73,101,0.25)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#62B6CB]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#BEE9E8]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

            <div className="relative z-10">
              {/* Avatar + name row */}
              <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-[28px] bg-[#62B6CB]/20 border-2 border-[#62B6CB]/30 flex items-center justify-center text-[#62B6CB] shadow-inner">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="font-black text-2xl tracking-tight italic text-white">Delivery Partner</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5 text-white/40" />
                    <p className="text-sm font-bold text-white/40 italic tracking-tight">{phone || "+91 98765 43210"}</p>
                  </div>
                </div>
              </div>

              {/* Trust score */}
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-[#62B6CB] text-[#62B6CB]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Trust Score</span>
                  </div>
                  <span className="font-black text-xl italic tracking-tighter text-[#62B6CB]">{score}/100</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full bg-[#62B6CB] rounded-full shadow-[0_0_10px_rgba(98,182,203,0.6)]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Stats Cards ── */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="bg-white rounded-[24px] p-4 shadow-xl border border-white/60 text-center">
                <div className="text-[22px] font-black text-[#1B4965] italic tracking-tighter leading-none">
                  {claims.length}
                </div>
                <div className="text-[8px] font-black text-[#1B4965]/40 uppercase tracking-widest mt-1">Events</div>
              </div>
              <div className="bg-white rounded-[24px] p-4 shadow-xl border border-white/60 text-center">
                <div className="text-[22px] font-black text-[#00CC6B] italic tracking-tighter leading-none">
                  ₹{totalClaimed}
                </div>
                <div className="text-[8px] font-black text-[#1B4965]/40 uppercase tracking-widest mt-1">Claimed</div>
              </div>
              <div className="bg-white rounded-[24px] p-4 shadow-xl border border-white/60 text-center">
                <div className="text-[22px] font-black italic tracking-tighter leading-none text-[#62B6CB]">
                  {hasPolicy ? "ON" : "OFF"}
                </div>
                <div className="text-[8px] font-black text-[#1B4965]/40 uppercase tracking-widest mt-1">Policy</div>
              </div>
            </motion.div>
          )}

          {/* ── Work Meta ── */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.3em] px-2">Work Details</h3>
            <div className="bg-white rounded-[32px] shadow-xl border border-white/60 overflow-hidden divide-y divide-[#1B4965]/5">
              <button className="w-full flex items-center justify-between p-6 hover:bg-[#1B4965]/2 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#62B6CB]/10 flex items-center justify-center text-[#62B6CB] group-hover:scale-110 transition-transform shadow-inner">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-black text-[#1B4965] text-sm italic tracking-tight">Active Zone</div>
                    <div className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-tighter mt-0.5">
                      {data.zone || "Anna Nagar"}, {data.city || "Chennai"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#1B4965]/10 group-hover:text-[#62B6CB] transition-colors" />
              </button>

              <button className="w-full flex items-center justify-between p-6 hover:bg-[#1B4965]/2 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#62B6CB]/10 flex items-center justify-center text-[#62B6CB] group-hover:scale-110 transition-transform shadow-inner">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-black text-[#1B4965] text-sm italic tracking-tight">Platform Details</div>
                    <div className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-tighter mt-0.5">
                      {data.platform || "Platform"} • ID: {data.workerId || "NOT_LINKED"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#1B4965]/10 group-hover:text-[#62B6CB] transition-colors" />
              </button>
            </div>
          </div>

          {/* ── Policy Status ── */}
          {hasPolicy && policy && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-3"
            >
              <h3 className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.3em] px-2">Active Policy</h3>
              <div className="bg-white rounded-[32px] p-6 shadow-xl border border-white/60">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-[#62B6CB]/10 flex items-center justify-center text-[#62B6CB] shadow-inner">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-[#62B6CB] uppercase tracking-wider">{policy.tier} Protection</div>
                    <div className="text-lg font-black text-[#1B4965] italic tracking-tighter">₹{policy.premium_amount}/wk</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1B4965]/5 rounded-[20px] p-3 text-center">
                    <div className="text-[14px] font-black text-[#1B4965] italic">₹{policy.hourly_benefit}</div>
                    <div className="text-[8px] font-black text-[#1B4965]/40 uppercase tracking-wider mt-0.5">/hr</div>
                  </div>
                  <div className="bg-[#1B4965]/5 rounded-[20px] p-3 text-center">
                    <div className="text-[14px] font-black text-[#1B4965] italic">₹{policy.weekly_cap}</div>
                    <div className="text-[8px] font-black text-[#1B4965]/40 uppercase tracking-wider mt-0.5">cap/wk</div>
                  </div>
                  <div className="bg-[#1B4965]/5 rounded-[20px] p-3 text-center">
                    <div className="text-[14px] font-black text-[#62B6CB] italic">₹{policyStatus.remaining_cap}</div>
                    <div className="text-[8px] font-black text-[#1B4965]/40 uppercase tracking-wider mt-0.5">left</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Payout Config ── */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.3em] px-2">Payout Config</h3>
            <div className="bg-white rounded-[32px] shadow-xl border border-white/60 overflow-hidden">
              <button className="w-full flex items-center justify-between p-6 hover:bg-[#1B4965]/2 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#00FF87]/10 flex items-center justify-center text-[#00CC6B] group-hover:scale-110 transition-transform shadow-inner">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-black text-[#1B4965] text-sm italic tracking-tight">Unified ID</div>
                    <div className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-tighter mt-0.5">
                      {data.upiId || "secure-partner@upi"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#1B4965]/10 group-hover:text-[#62B6CB] transition-colors" />
              </button>
            </div>
          </div>

          {/* ── Logout ── */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full h-16 rounded-[24px] bg-red-500/10 border-2 border-red-500/20 text-red-500 font-black text-xs uppercase tracking-[0.3em] italic flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all shadow-xl"
          >
            <LogOut className="w-5 h-5" />
            Terminate Session
          </motion.button>

          {/* App Info */}
          <div className="text-center space-y-1 pb-4">
            <p className="text-[10px] font-black text-[#1B4965]/20 uppercase tracking-[0.4em]">Zyro Ecosystem v1.0.4</p>
            <p className="text-[9px] font-bold text-[#1B4965]/15 italic">AI-Powered Parametric Income Protection</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
