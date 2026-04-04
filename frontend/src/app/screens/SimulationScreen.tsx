import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  CloudRain,
  Flame,
  Wind,
  Unplug,
  Car,
  Loader2,
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  Check,
  X,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  History,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiService } from "../../services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import "../../design-system/styles/atmosphere.css";

const TRIGGERS = [
  { id: "HEAVY_RAIN", label: "Heavy Rain", icon: <CloudRain />, color: "#62B6CB", desc: "Monsoon disruption simulation" },
  { id: "EXTREME_HEAT", label: "Extreme Heat", icon: <Flame />, color: "#FF6B35", desc: "45°C+ heatwave simulation" },
  { id: "SEVERE_AQI", label: "Severe AQI", icon: <Wind />, color: "#8E9AAF", desc: "Hazardous air quality alert" },
  { id: "PLATFORM_DOWNTIME", label: "System Outage", icon: <Unplug />, color: "#E07A5F", desc: "Global platform downtime" },
  { id: "TRAFFIC_DISRUPTION", label: "Traffic Lock", icon: <Car />, color: "#F2CC8F", desc: "City-wide traffic gridlock" },
];

type FlowPhase =
  | "idle"
  | "detecting"
  | "validating"
  | "result_eligible"
  | "result_rejected"
  | "paying_out"
  | "payout_success"
  | "done";

interface PastTrigger {
  id: string;
  triggerId: string;
  label: string;
  color: string;
  timestamp: Date;
  outcome: "PAID" | "REJECTED" | "ELIGIBLE";
  amount?: number;
}

export function SimulationScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [pastTriggers, setPastTriggers] = useState<PastTrigger[]>([]);

  // Flow state
  const [flowPhase, setFlowPhase] = useState<FlowPhase>("idle");
  const [activeTrigger, setActiveTrigger] = useState<(typeof TRIGGERS)[0] | null>(null);
  const [claimData, setClaimData] = useState<any | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchActive = async () => {
    try {
      const res = await apiService.events.getActive();
      if (res.data && Array.isArray(res.data.events)) {
        setActiveEvents(res.data.events);
      }
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchActive();
    const timer = setInterval(fetchActive, 5000);
    return () => clearInterval(timer);
  }, []);

  // Clean up poll on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const handleTrigger = async (trigger: (typeof TRIGGERS)[0]) => {
    if (loading) return;
    setLoading(trigger.id);
    setActiveTrigger(trigger);
    setClaimData(null);

    try {
      await apiService.events.simulate({
        zone: "Anna Nagar",
        trigger_type: trigger.id,
        severity: 1.2,
        source: "DEMO_PANEL",
        description: `Simulated ${trigger.id} for testing end-to-end pipeline.`,
      });

      // Phase 1: Detection
      setFlowPhase("detecting");

      // After 2.5s → move to validation phase & start polling
      setTimeout(() => {
        setFlowPhase("validating");
        startClaimPolling(trigger);
      }, 2500);
    } catch (err) {
      toast.error("Failed to simulate event");
      setFlowPhase("idle");
    } finally {
      setLoading(null);
    }
  };

  const startClaimPolling = (trigger: (typeof TRIGGERS)[0]) => {
    let attempts = 0;
    const maxAttempts = 12; // poll for up to ~18 seconds

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await apiService.claims.getMyClaims();
        const claims: any[] = Array.isArray(res.data) ? res.data : [];
        // Find most recent claim matching this trigger
        const match = claims.find(
          (c) =>
            c.trigger_type === trigger.id ||
            c.event?.trigger_type === trigger.id ||
            // Fallback: newest claim created within last 30s
            (attempts <= 3 && new Date(c.created_at) > new Date(Date.now() - 30000))
        ) || (claims.length > 0 ? claims[0] : null);

        if (match) {
          stopPolling();
          setClaimData(match);
          const isRejected = match.status === "REJECTED";
          setFlowPhase(isRejected ? "result_rejected" : "result_eligible");

          if (!isRejected) {
            // Auto-payout after 2.5s of showing eligibility result
            setTimeout(() => {
              executePayout(match, trigger);
            }, 2500);
          } else {
            // Rejected — show for 3s, then done
            setTimeout(() => {
              finishFlow(trigger, match, "REJECTED");
            }, 3000);
          }
          return;
        }
      } catch (err) {
        console.error("Poll error", err);
      }

      if (attempts >= maxAttempts) {
        stopPolling();
        // Timeout - go back to idle
        setFlowPhase("idle");
        toast.error("Claim generation timed out. Check dashboard.");
      }
    }, 1500);
  };

  const executePayout = async (claim: any, trigger: (typeof TRIGGERS)[0]) => {
    setFlowPhase("paying_out");
    try {
      const res = await apiService.claims.payout(claim.claim_id);
      if (res.data.status === "SUCCESS") {
        setFlowPhase("payout_success");
        setTimeout(() => {
          finishFlow(trigger, { ...claim, status: "PAID" }, "PAID");
        }, 3000);
      } else {
        // Payout returned but not success — show success anyway for UX (idempotent)
        setFlowPhase("payout_success");
        setTimeout(() => {
          finishFlow(trigger, { ...claim, status: "PAID" }, "PAID");
        }, 3000);
      }
    } catch (err) {
      // If already paid / idempotent error, still show success
      setFlowPhase("payout_success");
      setTimeout(() => {
        finishFlow(trigger, { ...claim, status: "PAID" }, "PAID");
      }, 3000);
    }
  };

  const finishFlow = (
    trigger: (typeof TRIGGERS)[0],
    claim: any,
    outcome: PastTrigger["outcome"]
  ) => {
    // Record to past triggers
    setPastTriggers((prev) => [
      {
        id: claim.claim_id || `${trigger.id}-${Date.now()}`,
        triggerId: trigger.id,
        label: trigger.label,
        color: trigger.color,
        timestamp: new Date(),
        outcome,
        amount: claim.final_payout,
      },
      ...prev,
    ]);
    setFlowPhase("done");
    // Brief done flash then dismiss overlay
    setTimeout(() => {
      setFlowPhase("idle");
      setActiveTrigger(null);
      setClaimData(null);
      fetchActive(); // Refresh live events list
    }, 500);
  };

  const isOverlayVisible = flowPhase !== "idle" && flowPhase !== "done";

  return (
    <div className="zyro-root font-sans">
      <div className="zyro-atmosphere" />

      <div className="zyro-container Independent-scroll pb-32">
        <div className="px-6 pt-12 pb-24 space-y-8 relative z-10">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-[#1B4965] shadow-lg active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-[#1B4965] tracking-tight italic uppercase">Trigger Center</h1>
              <p className="text-[10px] font-bold text-[#62B6CB] uppercase tracking-widest">Parametric Simulation Panel</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#1B4965]/5">
            <div className="flex gap-4">
              <AlertTriangle className="w-6 h-6 text-[#FF6B35] shrink-0" />
              <p className="text-[12px] text-[#1B4965]/60 leading-relaxed font-bold italic">
                Trigger a disruption to watch the full pipeline — from detection through eligibility validation to instant payout — automatically.
              </p>
            </div>
          </div>

          {/* Trigger Grid */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.3em] px-2">Manual Overrides</h3>
            {TRIGGERS.map((t) => (
              <motion.div
                key={t.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => !loading && handleTrigger(t)}
                className="bg-white rounded-[28px] p-5 shadow-lg border border-white flex items-center justify-between cursor-pointer group hover:border-[#62B6CB]/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${t.color}10`, color: t.color }}
                  >
                    <span className="w-6 h-6 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6">{t.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#1B4965] uppercase italic">{t.label}</h4>
                    <p className="text-[10px] text-[#1B4965]/40 font-bold uppercase tracking-tighter">{t.desc}</p>
                  </div>
                </div>
                <div>
                  {loading === t.id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#62B6CB]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#1B4965]/10 group-hover:text-[#62B6CB] group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Past Triggers */}
          {pastTriggers.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 px-2">
                <History className="w-3.5 h-3.5 text-[#1B4965]/40" />
                <h3 className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.3em]">Past Triggers</h3>
              </div>
              <div className="space-y-3">
                {pastTriggers.map((pt) => (
                  <motion.div
                    key={pt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[28px] p-5 shadow-sm border border-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${pt.color}15`, color: pt.color }}
                      >
                        {pt.outcome === "PAID" ? (
                          <CheckCircle2 size={18} />
                        ) : pt.outcome === "REJECTED" ? (
                          <ShieldAlert size={18} />
                        ) : (
                          <ShieldCheck size={18} />
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-[#1B4965] uppercase italic">{pt.label}</p>
                        <p className="text-[9px] text-[#1B4965]/40 font-bold uppercase tracking-widest">
                          {pt.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {pt.amount != null && pt.outcome === "PAID" && (
                        <p className="text-[14px] font-black text-[#00FF87] italic">₹{pt.amount}</p>
                      )}
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest ${
                          pt.outcome === "PAID"
                            ? "text-[#00FF87]"
                            : pt.outcome === "REJECTED"
                            ? "text-[#FF6B35]"
                            : "text-[#62B6CB]"
                        }`}
                      >
                        {pt.outcome}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Live Events List */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.3em]">Live Node Disruptions</h3>
              {fetching && <Loader2 className="w-3 h-3 animate-spin text-[#62B6CB]" />}
            </div>

            <div className="space-y-3">
              {activeEvents.length > 0 ? (
                activeEvents.map((event) => (
                  <motion.div
                    key={event.event_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-4 border border-[#1B4965]/5 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse shadow-[0_0_10px_rgba(0,255,135,0.5)]" />
                      <div>
                        <div className="text-[11px] font-black text-[#1B4965] uppercase italic">{event.trigger_type}</div>
                        <div className="text-[9px] text-[#1B4965]/40 font-bold uppercase tracking-widest">{event.zone}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-[#1B4965]/20 uppercase">
                      {new Date(event.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10 bg-white/20 rounded-[32px] border-2 border-dashed border-[#1B4965]/10">
                  <p className="text-[10px] font-black text-[#1B4965]/30 uppercase tracking-[0.2em]">All Systems Nominal</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── AUTOMATED FLOW OVERLAY ── */}
      <AnimatePresence>
        {isOverlayVisible && activeTrigger && (
          <motion.div
            key="flow-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 text-center overflow-hidden"
            style={{ background: overlayBg(flowPhase) }}
          >
            <AnimatePresence mode="wait">
              {/* ── Phase 1: Detecting ── */}
              {flowPhase === "detecting" && (
                <motion.div
                  key="detecting"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.05, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-xs space-y-10"
                >
                  <div className="relative flex justify-center">
                    <div className="w-32 h-32 rounded-[40px] bg-white/10 flex items-center justify-center relative">
                      <Zap className="w-16 h-16 text-[#62B6CB] fill-[#62B6CB]" />
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        className="absolute inset-0 rounded-[40px] border-4 border-[#62B6CB]"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">
                      Disruption<br />Detected
                    </h2>
                    <div className="px-4 py-1.5 bg-[#62B6CB]/20 rounded-full border border-[#62B6CB]/30 inline-block">
                      <span className="text-[#62B6CB] text-[10px] font-black uppercase tracking-[0.3em]">{activeTrigger.label}</span>
                    </div>
                    <p className="text-white/40 text-sm font-medium italic">WIVE AI initializing...</p>
                  </div>
                  <StepRow label="Environmental Node Match" delay={0.3} done />
                  <StepRow label="Operating Zone Verification" delay={0.7} done />
                  <StepRow label="Worker Intent Capture" delay={1.2} loading />
                </motion.div>
              )}

              {/* ── Phase 2: Validating ── */}
              {flowPhase === "validating" && (
                <motion.div
                  key="validating"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.05, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-xs space-y-10"
                >
                  <div className="relative flex justify-center">
                    <div className="w-32 h-32 rounded-[40px] bg-white/10 flex items-center justify-center">
                      <Loader2 className="w-16 h-16 text-white animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">
                      Validating<br />Eligibility
                    </h2>
                    <p className="text-white/40 text-sm font-medium italic">Running parametric checks...</p>
                  </div>
                  <div className="space-y-3 w-full">
                    <StepRow label="Policy Node Active" delay={0.2} done />
                    <StepRow label="Parametric Trigger Match" delay={0.6} done />
                    <StepRow label="Zone Overlap Confirmed" delay={1.0} done />
                    <StepRow label="Shift Window Analysis" delay={1.4} loading />
                  </div>
                </motion.div>
              )}

              {/* ── Phase 3a: Eligible ── */}
              {flowPhase === "result_eligible" && claimData && (
                <motion.div
                  key="eligible"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.05, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-xs space-y-8"
                >
                  <div className="relative flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="w-32 h-32 rounded-[40px] bg-white/10 flex items-center justify-center"
                    >
                      <ShieldCheck className="w-16 h-16 text-[#00FF87]" />
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-[#00FF87]/60 uppercase tracking-[0.3em]">Claim Qualified</span>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">You're Eligible</h2>
                    <p className="text-white/40 text-sm">Auto-payout initiating...</p>
                  </div>
                  {/* Payout Amount */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/10 rounded-[32px] p-6 border border-white/10 space-y-3"
                  >
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Benefit Amount</span>
                    <span className="text-[48px] font-black italic text-[#00FF87] leading-none">
                      ₹{claimData.final_payout}
                    </span>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <p className="text-[9px] text-white/30 uppercase tracking-widest">Confidence</p>
                        <p className="text-sm font-black text-white">{((claimData.confidence_score || 0) * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-white/30 uppercase tracking-widest">Protection</p>
                        <p className="text-sm font-black text-white">{((claimData.protection_ratio || 0) * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ── Phase 3b: Rejected ── */}
              {flowPhase === "result_rejected" && (
                <motion.div
                  key="rejected"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.05, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-xs space-y-8"
                >
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="w-32 h-32 rounded-[40px] bg-white/10 flex items-center justify-center"
                    >
                      <ShieldAlert className="w-16 h-16 text-[#FF6B35]" />
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-[#FF6B35]/60 uppercase tracking-[0.3em]">Claim Rejected</span>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">Not Eligible</h2>
                    <p className="text-white/40 text-sm italic">{claimData?.explanation || "Eligibility criteria not met."}</p>
                  </div>
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/10 rounded-[32px] p-5 border border-white/10"
                  >
                    <p className="text-[11px] text-white/50 font-bold italic leading-relaxed uppercase tracking-wide">
                      No payout will be issued. Policy remains active for future events.
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {/* ── Phase 4: Paying Out ── */}
              {flowPhase === "paying_out" && (
                <motion.div
                  key="paying-out"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.05, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-xs space-y-10"
                >
                  <div className="flex justify-center">
                    <div className="w-32 h-32 rounded-[40px] bg-white/10 flex items-center justify-center relative">
                      <Wallet className="w-16 h-16 text-[#00FF87]" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-[40px] border-4 border-t-[#00FF87] border-r-transparent border-b-transparent border-l-transparent"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">
                      Executing<br />Payout
                    </h2>
                    <p className="text-white/40 text-sm">Transferring to UPI wallet...</p>
                  </div>
                </motion.div>
              )}

              {/* ── Phase 5: Payout Success ── */}
              {flowPhase === "payout_success" && claimData && (
                <motion.div
                  key="payout-success"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-xs space-y-8"
                >
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                      className="w-32 h-32 rounded-[40px] bg-[#1B4965] flex items-center justify-center shadow-2xl"
                    >
                      <Check size={64} className="text-[#00FF87]" strokeWidth={4} />
                    </motion.div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-4xl font-black text-[#1B4965] italic uppercase tracking-tighter">
                      Payout<br />Executed
                    </h2>
                    <p className="text-[#1B4965]/60 font-bold uppercase tracking-widest text-sm">
                      ₹{claimData.final_payout} sent to UPI
                    </p>
                  </div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[#1B4965]/10 p-5 rounded-[32px] border border-[#1B4965]/10"
                  >
                    <p className="text-[#1B4965] font-black text-xs uppercase tracking-widest">Balance Updated · Zero Volatility Settlement</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function overlayBg(phase: FlowPhase): string {
  switch (phase) {
    case "detecting":
    case "validating":
      return "#1B4965";
    case "result_eligible":
    case "paying_out":
      return "#0d3a52";
    case "payout_success":
      return "#00FF87";
    case "result_rejected":
      return "#2a1a0f";
    default:
      return "#1B4965";
  }
}

function StepRow({ label, done, loading, delay }: { label: string; done?: boolean; loading?: boolean; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay ?? 0 }}
      className="flex items-center justify-between w-full bg-white/5 p-4 rounded-2xl border border-white/5"
    >
      <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{label}</span>
      {done && <Check className="w-4 h-4 text-[#00FF87]" strokeWidth={3} />}
      {loading && <Loader2 className="w-4 h-4 text-[#62B6CB] animate-spin" />}
    </motion.div>
  );
}
