import React, { useState, useEffect, useMemo } from "react";
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
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuthStore } from "../../store/useAuthStore";
import { apiService } from "../../services/api";
import { Button } from "../../design-system/components/Button";
import { BottomNav } from "../components/BottomNav";
import { StatsStrip } from "../components/StatsStrip";
import "../../design-system/styles/atmosphere.css";

// ─── Adapters ─────────────────────────────────────────────────────────────────
import {
  UIClaim,
  mapClaims,
  computeClaimStats,
  laneColor,
  laneBg,
} from "../../adapters/claimAdapter";
import { UIPolicy, mapPolicyStatus } from "../../adapters/policyAdapter";

// ─── Component ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const navigate = useNavigate();
  const { name, phone } = useAuthStore();

  const [policy, setPolicy]         = useState<UIPolicy | null>(null);
  const [claims, setClaims]         = useState<UIClaim[]>([]);
  const [loading, setLoading]       = useState(true);

  // ── Fetch → Transform → Store ──────────────────────────────────────────────
  const fetchData = async () => {
    const [policyRes, claimsRes] = await Promise.allSettled([
      apiService.policy.getStatus(),
      apiService.claims.getMyClaims(),
    ]);

    // Policy — GET /policies/status returns GenericResponse {data: DashboardPolicyStatus}
    if (policyRes.status === "fulfilled") {
      // Backend returns GenericResponse: res.data = { status, message, data: DashboardPolicyStatus }
      const raw = policyRes.value.data?.data ?? policyRes.value.data ?? null;
      setPolicy(mapPolicyStatus(raw));
    }

    // Claims — GET /claims/me returns List[ClaimResponse] DIRECTLY (no wrapper)
    if (claimsRes.status === "fulfilled") {
      const raw = claimsRes.value.data;
      setClaims(mapClaims(Array.isArray(raw) ? raw : []));
    }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [phone]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived (useMemo, not inside JSX) ──────────────────────────────────────
  const stats = useMemo(() => computeClaimStats(claims), [claims]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="zyro-root font-sans">
        <div className="zyro-atmosphere" />
        <div className="zyro-container flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#62B6CB]" />
            <p className="text-[#1B4965]/40 font-bold uppercase tracking-widest text-[10px]">
              Loading dashboard...
            </p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Derived UI flags ────────────────────────────────────────────────────────
  const hasPolicy    = policy?.has_active_policy ?? false;
  const trustScore   = profile?.trust_score ?? 85;

  return (
    <div className="zyro-root font-sans">
      <div className="zyro-atmosphere" />

      <div className="zyro-container pb-32">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="px-6 pt-10 pb-6 flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${hasPolicy ? 'bg-[#62B6CB]' : 'bg-[#FF6B35]'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${hasPolicy ? 'text-[#62B6CB]' : 'text-[#FF6B35]'}`}>
                {hasPolicy ? 'Online & Protected' : 'Online · Unprotected'}
              </span>
            </div>
            <h1 className="text-[28px] font-black text-[#1B4965] tracking-tight">
              Hey, {name || 'Partner'}
            </h1>
            <div className="flex items-center gap-1.5 text-[#1B4965]/40">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-[12px] font-bold uppercase tracking-tighter">
                Chennai • Anna Nagar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/simulate")}
              className="w-14 h-14 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow-sm cursor-pointer text-[#62B6CB]"
            >
              <Zap className="w-7 h-7 fill-[#62B6CB]" />
            </motion.div>

            <motion.div
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/profile")}
              className="w-14 h-14 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 flex flex-col items-center justify-center shadow-sm cursor-pointer"
            >
              <span className="text-[18px] font-black text-[#62B6CB] leading-none">{trustScore}</span>
              <span className="text-[8px] font-black text-[#1B4965]/40 uppercase tracking-tighter mt-1">TRUST</span>
            </motion.div>
          </div>
        </header>

        <main className="px-6 space-y-8 relative z-10">

          {/* ── Stats Strip ─────────────────────────────────────────────── */}
          <StatsStrip
            totalSaved={stats.totalSaved}
            totalLost={stats.totalLost}
            protectionRatio={stats.protectionRatio}
          />

          {/* ── Policy Card ──────────────────────────────────────────────── */}
          {hasPolicy && policy ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#BEE9E8] rounded-[40px] p-8 text-[#1B4965] shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative overflow-hidden group border-2 border-white/50"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#62B6CB]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700" />

              <div className="relative z-10 space-y-8">
                {/* Tier + Premium */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.2em]">
                      {policy.tier || '—'} Coverage
                    </span>
                    <div className="flex items-baseline gap-1">
                      <h2 className="text-[42px] font-black text-[#1B4965] tracking-tighter italic leading-none">
                        ₹{policy.premium_amount}
                      </h2>
                      <span className="text-[14px] font-bold text-[#1B4965]/30">/wk</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-[#1B4965] flex items-center justify-center text-[#BEE9E8] shadow-xl">
                    <ShieldCheck size={28} />
                  </div>
                </div>

                {/* Hourly + Pool */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/40 backdrop-blur-sm p-5 rounded-[24px] border border-white/60">
                    <span className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-wider block mb-1">Hourly Rate</span>
                    <span className="text-2xl font-black italic">₹{policy.hourly_benefit}</span>
                  </div>
                  <div className="bg-white/40 backdrop-blur-sm p-5 rounded-[24px] border border-white/60">
                    <span className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-wider block mb-1">Weekly Pool</span>
                    <span className="text-2xl font-black italic">₹{policy.remaining_cap}</span>
                  </div>
                </div>

                {/* Covered triggers */}
                {policy.covered_triggers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {policy.covered_triggers.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 rounded-full bg-[#1B4965]/8 border border-[#1B4965]/10 text-[9px] font-black uppercase tracking-wider text-[#1B4965]/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Window */}
                <div className="flex items-center justify-between pt-6 border-t border-[#1B4965]/10">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 opacity-40" />
                    <span className="text-[10px] font-bold opacity-60">
                      Window: {policy.coverage_window || '—'}
                    </span>
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
                  <p className="text-[14px] text-[#1B4965]/60 font-medium leading-tight">
                    Your income is at risk today. Activate protection to earn safely.
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate("/plan-selection")} className="w-full h-14 rounded-2xl font-bold text-base">
                Activate Protection
              </Button>
            </motion.div>
          )}

          {/* ── Saved vs Lost ────────────────────────────────────────────── */}
          {claims.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/40 backdrop-blur-xl rounded-[32px] p-7 border border-white/60 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-black text-[#1B4965]/50 uppercase tracking-[0.2em]">
                  This Week's Impact
                </h3>
                <TrendingUp className="w-4 h-4 text-[#62B6CB]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#00FF87]/10 border border-[#00FF87]/20 rounded-[20px] p-5 space-y-1">
                  <span className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-wider block">Earnings Saved</span>
                  <span className="text-[22px] font-black text-[#00FF87]">
                    ₹{stats.totalSaved.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-[20px] p-5 space-y-1">
                  <span className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-wider block">Uncovered</span>
                  <span className="text-[22px] font-black text-[#FF6B35]">
                    ₹{stats.totalLost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Protection ratio bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-wider">Coverage Efficiency</span>
                  <span className="text-[13px] font-black text-[#62B6CB]">{stats.protectionRatio}%</span>
                </div>
                <div className="h-2 bg-[#1B4965]/8 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.protectionRatio}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#62B6CB] to-[#00FF87]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Claims List ──────────────────────────────────────────────── */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[12px] font-bold text-[#1B4965]/40 uppercase tracking-[0.2em]">Active Payouts</h3>
              <TrendingUp className="w-4 h-4 text-[#62B6CB]" />
            </div>

            {claims.length > 0 ? (
              <div className="space-y-4">
                {claims.map((claim, i) => {
                  const isPaid = claim.status === 'PAID';
                  const iconBg = isPaid ? 'bg-[#00FF87]/20 text-[#00FF87]' : laneBg(claim.confidence_lane);

                  return (
                    <motion.div
                      key={claim.claim_id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => navigate(`/claim-details/${claim.claim_id}`)}
                      className="bg-white/40 backdrop-blur-sm rounded-[28px] p-6 border border-white/60 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0 ${iconBg}`}>
                          {isPaid ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#1B4965]">
                            {isPaid ? 'Payout Sent' : 'Eligibility Detected'}
                          </h4>
                          <p className="text-[10px] text-[#1B4965]/40 truncate max-w-[160px]">
                            {claim.explanation || new Date(claim.created_at).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3 flex-shrink-0">
                        <div>
                          <div className="text-lg font-black text-[#1B4965]">
                            ₹{claim.final_payout.toLocaleString('en-IN')}
                          </div>
                          {claim.uncovered_loss > 0 && (
                            <div className="text-[9px] font-bold text-[#FF6B35] mt-0.5">
                              +₹{claim.uncovered_loss.toLocaleString('en-IN')} uncovered
                            </div>
                          )}
                          {/* Confidence lane badge */}
                          <span
                            className="inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider"
                            style={{
                              background: `${laneColor(claim.confidence_lane)}18`,
                              color: laneColor(claim.confidence_lane),
                            }}
                          >
                            {claim.confidence_lane}
                          </span>
                        </div>
                        <ChevronRight size={18} className="text-[#1B4965]/20 group-hover:text-[#62B6CB] transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* ── Empty State ── */
              <div className="bg-white/20 rounded-[28px] p-14 border border-white/40 border-dashed text-center">
                <div className="w-14 h-14 rounded-full bg-white/40 flex items-center justify-center mx-auto mb-4 text-[#1B4965]/20">
                  <Activity size={26} />
                </div>
                <p className="text-[14px] text-[#1B4965]/40 font-bold uppercase tracking-widest">No claims yet</p>
                <p className="text-[12px] text-[#1B4965]/30 font-medium mt-1">Coverage starts when disruption hits</p>
              </div>
            )}
          </div>

          {/* ── System Status ─────────────────────────────────────────────── */}
          <div className="bg-white/40 backdrop-blur-xl rounded-[32px] py-5 px-6 flex items-center justify-between border border-white/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#62B6CB] shadow-[0_0_10px_#62B6CB] animate-pulse" />
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
