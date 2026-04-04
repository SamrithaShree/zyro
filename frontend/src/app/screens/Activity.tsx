import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import {
  Loader2,
  Shield,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  BarChart3,
  Wallet,
  CloudRain,
  Flame,
  Wind,
  Unplug,
  Car,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { apiService } from "../../services/api";
import "../../design-system/styles/atmosphere.css";

const TRIGGER_META: Record<string, { color: string; icon: React.ReactNode }> = {
  HEAVY_RAIN:        { color: "#62B6CB", icon: <CloudRain className="w-5 h-5" /> },
  EXTREME_HEAT:      { color: "#FF6B35", icon: <Flame className="w-5 h-5" /> },
  SEVERE_AQI:        { color: "#8E9AAF", icon: <Wind className="w-5 h-5" /> },
  PLATFORM_DOWNTIME: { color: "#E07A5F", icon: <Unplug className="w-5 h-5" /> },
  TRAFFIC_DISRUPTION:{ color: "#F2CC8F", icon: <Car className="w-5 h-5" /> },
  RAIN:              { color: "#62B6CB", icon: <CloudRain className="w-5 h-5" /> },
  POLLUTION:         { color: "#8E9AAF", icon: <Wind className="w-5 h-5" /> },
  HEAT:              { color: "#FF6B35", icon: <Flame className="w-5 h-5" /> },
};

function getTriggerMeta(eventType: string) {
  return TRIGGER_META[eventType] ?? { color: "#62B6CB", icon: <Zap className="w-5 h-5" /> };
}

export function Activity() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.claims.getMyClaims();
      if (Array.isArray(res.data)) {
        setClaims(res.data);
      }
    } catch {
      setError("Failed to load activity. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ── Computed stats ──
  const paid = claims.filter((c) => c.status === "PAID");
  const rejected = claims.filter((c) => c.status === "REJECTED");
  const totalClaimed = paid.reduce((s, c) => s + (c.final_payout || 0), 0);
  const totalLoss = paid.reduce((s, c) => s + (c.estimated_loss || 0), 0);
  const netGain = totalClaimed - totalLoss;

  return (
    <div className="zyro-root font-sans">
      <div className="zyro-atmosphere" />

      <div className="zyro-container pb-32">
        <div className="px-6 pt-12 pb-8 space-y-8 relative z-10">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-[28px] font-black text-[#1B4965] tracking-tight italic uppercase leading-none">
                Activity
              </h1>
              <p className="text-[10px] font-black text-[#62B6CB] uppercase tracking-[0.3em]">
                Transaction History
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xl border border-white flex items-center justify-center text-[#62B6CB]">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* ── Stats Strip (only when data available) ── */}
          {!loading && claims.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h3 className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.3em] px-1">Lifetime Summary</h3>

              {/* Top row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Total Claimed */}
                <div className="bg-[#1B4965] rounded-[28px] p-5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#62B6CB]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Wallet className="w-3.5 h-3.5 text-[#62B6CB]" />
                      <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Total Paid</span>
                    </div>
                    <div className="text-[26px] font-black text-[#62B6CB] italic leading-none tracking-tighter">
                      ₹{totalClaimed}
                    </div>
                    <div className="text-[8px] font-bold text-white/30 uppercase tracking-wider mt-1">
                      {paid.length} payout{paid.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                {/* Events count */}
                <div className="bg-white rounded-[28px] p-5 shadow-xl border border-white/60 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <BarChart3 className="w-3.5 h-3.5 text-[#1B4965]/40" />
                      <span className="text-[8px] font-black text-[#1B4965]/40 uppercase tracking-widest">Triggers</span>
                    </div>
                    <div className="text-[26px] font-black text-[#1B4965] italic leading-none tracking-tighter">
                      {claims.length}
                    </div>
                    <div className="text-[8px] font-bold text-[#1B4965]/30 uppercase tracking-wider mt-1">
                      {rejected.length} rejected
                    </div>
                  </div>
                </div>
              </div>

              {/* Net gain vs loss row */}
              <div className="bg-white rounded-[32px] p-6 shadow-xl border border-white/60">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.2em]">Protection Impact</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingDown className="w-3.5 h-3.5 text-[#FF6B35]" />
                      <span className="text-[8px] font-black text-[#1B4965]/40 uppercase tracking-wider">Est. Loss</span>
                    </div>
                    <div className="text-[22px] font-black text-[#FF6B35] italic tracking-tighter leading-none">
                      ₹{totalLoss}
                    </div>
                    <div className="text-[8px] text-[#1B4965]/30 font-bold uppercase mt-1">without zyro</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-[#00CC6B]" />
                      <span className="text-[8px] font-black text-[#1B4965]/40 uppercase tracking-wider">Net Gain</span>
                    </div>
                    <div className={`text-[22px] font-black italic tracking-tighter leading-none ${netGain >= 0 ? "text-[#00CC6B]" : "text-[#FF6B35]"}`}>
                      {netGain >= 0 ? "+" : ""}₹{netGain}
                    </div>
                    <div className="text-[8px] text-[#1B4965]/30 font-bold uppercase mt-1">covered income</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Claims List ── */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.3em] px-1">All Events</h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white/40 rounded-[28px] animate-pulse border border-white/60" />
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-[32px] p-10 shadow-xl text-center border border-white/60">
                <AlertCircle className="w-10 h-10 text-[#FF6B35] mx-auto mb-4" />
                <p className="text-[13px] font-black text-[#1B4965] italic mb-4">{error}</p>
                <button
                  onClick={load}
                  className="text-[10px] font-black text-[#62B6CB] uppercase tracking-widest underline underline-offset-4"
                >
                  Retry
                </button>
              </div>
            ) : claims.length === 0 ? (
              <div className="bg-white rounded-[40px] p-14 shadow-xl text-center border border-white/60">
                <div className="w-20 h-20 bg-[#1B4965]/5 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-[#1B4965]/20">
                  <Shield size={40} />
                </div>
                <h3 className="text-xl font-black text-[#1B4965] italic mb-2 uppercase">No triggers yet</h3>
                <p className="text-[13px] text-[#1B4965]/40 max-w-[220px] mx-auto font-medium leading-relaxed">
                  Zyro is monitoring your zone 24/7. Claims trigger automatically when disruptions are detected.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {claims.map((claim, i) => {
                  const meta = getTriggerMeta(claim.trigger_type || claim.event?.trigger_type || "");
                  const isPaid = claim.status === "PAID";
                  const isRejected = claim.status === "REJECTED";
                  return (
                    <motion.div
                      key={claim.claim_id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/claim-details/${claim.claim_id}`)}
                      className="bg-white rounded-[28px] p-5 shadow-xl border border-white flex items-center gap-4 group active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner"
                        style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                      >
                        {meta.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-black text-sm text-[#1B4965] italic tracking-tight">
                            {(claim.trigger_type || claim.event?.trigger_type || "Unknown")
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (l: string) => l.toUpperCase())}{" "}
                            Disruption
                          </p>
                          {isPaid ? (
                            <span className="text-[#00CC6B] font-black text-sm italic">+₹{claim.final_payout}</span>
                          ) : isRejected ? (
                            <span className="text-[9px] px-3 py-1 bg-[#FF6B35]/10 text-[#FF6B35] rounded-full font-black uppercase tracking-wider">
                              Rejected
                            </span>
                          ) : (
                            <span className="text-[9px] px-3 py-1 bg-[#62B6CB]/10 text-[#62B6CB] rounded-full font-black uppercase tracking-wider">
                              Review
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-[10px] font-bold text-[#1B4965]/30 uppercase tracking-tighter">
                            {new Date(claim.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                          <span className="text-[#1B4965]/20">·</span>
                          <span className="text-[10px] font-bold text-[#1B4965]/30 uppercase tracking-tighter truncate">
                            {claim.zone || "Anna Nagar"}
                          </span>
                          {claim.impact_reasoning?.event_duration_hours && (
                            <>
                              <span className="text-[#1B4965]/20">·</span>
                              <span className="text-[10px] font-bold text-[#1B4965]/30 uppercase tracking-tighter">
                                {claim.impact_reasoning.event_duration_hours}h
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status icon + chevron */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isPaid ? (
                          <CheckCircle2 className="w-5 h-5 text-[#00CC6B]" />
                        ) : isRejected ? (
                          <AlertCircle className="w-5 h-5 text-[#FF6B35]" />
                        ) : (
                          <Loader2 className="w-5 h-5 text-[#62B6CB] animate-spin" />
                        )}
                        <ChevronRight className="w-4 h-4 text-[#1B4965]/10 group-hover:text-[#62B6CB] transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
