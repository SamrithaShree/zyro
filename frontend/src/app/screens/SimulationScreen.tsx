import React, { useState, useEffect, useRef, useCallback } from "react";
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
  TrendingUp,
  RefreshCw,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiService } from "../../services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import "../../design-system/styles/atmosphere.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimelineEntry {
  id: string;
  time: string;
  label: string;
  detail?: string;
  type: "info" | "success" | "error" | "processing";
}

interface ClaimDist {
  HIGH: number;
  MEDIUM: number;
  REVIEW: number;
}

interface ActiveEventUI {
  event_id: string;
  zone: string;
  trigger_type: string;
  severity: number;
  start_time: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TRIGGERS = [
  { id: "HEAVY_RAIN",          label: "Heavy Rain",     icon: <CloudRain />, color: "#62B6CB", desc: "Monsoon disruption simulation" },
  { id: "EXTREME_HEAT",        label: "Extreme Heat",   icon: <Flame />,     color: "#FF6B35", desc: "45°C+ heatwave simulation" },
  { id: "SEVERE_AQI",          label: "Severe AQI",     icon: <Wind />,      color: "#8E9AAF", desc: "Hazardous air quality alert" },
  { id: "PLATFORM_DOWNTIME",   label: "System Outage",  icon: <Unplug />,    color: "#E07A5F", desc: "Global platform downtime" },
  { id: "TRAFFIC_DISRUPTION",  label: "Traffic Lock",   icon: <Car />,       color: "#F2CC8F", desc: "City-wide traffic gridlock" },
];

const ZONES = ["Anna Nagar", "T Nagar", "Adyar", "Velachery", "Tambaram", "Guindy"];

const ts = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

// ─── Component ────────────────────────────────────────────────────────────────
export function SimulationScreen() {
  const navigate = useNavigate();

  // Simulation state
  const [isRunning, setIsRunning]         = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [selectedZone, setSelectedZone]   = useState("Anna Nagar");
  const [severity, setSeverity]           = useState(1.2);
  const [activeEvent, setActiveEvent]     = useState<any | null>(null);
  const [claimDist, setClaimDist]         = useState<ClaimDist>({ HIGH: 0, MEDIUM: 0, REVIEW: 0 });
  const [timeline, setTimeline]           = useState<TimelineEntry[]>([]);
  const [triggerPassed, setTriggerPassed] = useState<boolean | null>(null);

  // Live events panel
  const [liveEvents, setLiveEvents]       = useState<ActiveEventUI[]>([]);
  const [fetchingLive, setFetchingLive]   = useState(true);

  const timelineRef = useRef<HTMLDivElement>(null);

  // ── Timeline helpers (stable refs) ──────────────────────────────────────────
  const addLog = useCallback((entry: Omit<TimelineEntry, "id" | "time">) => {
    setTimeline((prev) => [
      ...prev,
      { ...entry, id: crypto.randomUUID(), time: ts() },
    ]);
    // Auto-scroll timeline
    setTimeout(() => {
      timelineRef.current?.scrollTo({ top: timelineRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  // ── Fetch live events (every 5s) ─────────────────────────────────────────────
  const fetchLiveEvents = useCallback(async () => {
    try {
      const res = await apiService.events.getActive();
      // GET /events/active returns ActiveEventsResponse { events: [...] } directly
      const events: ActiveEventUI[] = (res.data?.events ?? []).map((e: any) => ({
        event_id:     String(e.event_id    ?? ""),
        zone:         String(e.zone        ?? "—"),
        trigger_type: String(e.trigger_type?? "—"),
        severity:     Number(e.severity    ?? 1),
        start_time:   String(e.start_time  ?? new Date().toISOString()),
      }));
      setLiveEvents(events);
    } catch {
      // silently fail — not critical
    } finally {
      setFetchingLive(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveEvents();
    const interval = setInterval(fetchLiveEvents, 5000);
    return () => clearInterval(interval);
  }, [fetchLiveEvents]);

  // ── Build claim distribution from backend data ────────────────────────────
  const deriveClaimDist = (data: any): ClaimDist => {
    // Backend may return affected_policy_count in simulate response
    const total = Number(data?.affected_policy_count ?? data?.affected_worker_count ?? 0);
    if (total === 0) return { HIGH: 0, MEDIUM: 0, REVIEW: 0 };
    const high   = Math.floor(total * 0.82);
    const medium = Math.floor(total * 0.14);
    const review = total - high - medium;
    return { HIGH: high, MEDIUM: medium, REVIEW: review };
  };

  // ── Run simulation ──────────────────────────────────────────────────────────
  const handleSimulate = useCallback(async () => {
    if (!selectedTrigger || isRunning) return;
    setIsRunning(true);
    setActiveEvent(null);
    setTriggerPassed(null);
    setClaimDist({ HIGH: 0, MEDIUM: 0, REVIEW: 0 });
    setTimeline([]);

    addLog({ type: "info",       label: "Simulation started",            detail: `${selectedTrigger} · ${selectedZone} · ${severity}×` });
    addLog({ type: "processing", label: "Sending trigger to WIVE Engine", detail: "POST /events/simulate" });

    try {
      const res = await apiService.events.simulate({
        zone:        selectedZone,
        trigger_type: selectedTrigger,
        severity,
        source:      "MET_OFFICE",
        description: `Parametric trigger: ${selectedTrigger} in ${selectedZone}`,
      });

      // POST /events/simulate → GlobalResponse { status, data: EventSimulateData }
      const payload = res.data?.data ?? res.data ?? {};
      const passed  = Boolean(payload?.trigger_passed ?? res.data?.status === "SUCCESS");
      const event   = payload?.event ?? null;
      const dist    = deriveClaimDist(payload);

      setTriggerPassed(passed);

      if (!passed) {
        addLog({ type: "error", label: "Tri-Gate validation REJECTED", detail: res.data?.message ?? "Trigger did not pass environmental gate" });
        toast.error("Trigger rejected by WIVE Engine");
        setIsRunning(false);
        return;
      }

      // ── Successful simulation ────────────────────────────────────────────
      addLog({ type: "success",    label: "Tri-Gate validation PASSED",   detail: `Event ${event?.event_id ?? "created"}` });
      addLog({ type: "processing", label: "Environmental Node Match",      detail: `Zone: ${selectedZone}` });

      await delay(600);
      addLog({ type: "success",    label: "Parametric Contract Matched",  detail: `${payload.affected_policy_count ?? 0} policies eligible` });

      await delay(500);
      addLog({ type: "processing", label: "WIVE Engine routing claims",   detail: `${payload.affected_worker_count ?? 0} workers in zone` });

      await delay(700);
      setActiveEvent(event);
      setClaimDist(dist);
      addLog({ type: "success",    label: "Claim batch generated",        detail: `HIGH ${dist.HIGH} · MED ${dist.MEDIUM} · REVIEW ${dist.REVIEW}` });

      await delay(400);
      addLog({ type: "info",       label: "PayoutEngine: HIGH-lane batch", detail: `${dist.HIGH} instant payouts queued` });

      await delay(600);
      addLog({ type: "success",    label: "Pipeline complete",            detail: "Background task dispatched — check Dashboard" });

      toast.success(`Pipeline launched — ${payload.affected_worker_count ?? 0} workers processed`);
      fetchLiveEvents();
    } catch (err: any) {
      addLog({ type: "error", label: "Simulation failed", detail: err?.response?.data?.detail ?? err?.message ?? "Unknown error" });
      toast.error("Simulation failed — see timeline");
    } finally {
      setIsRunning(false);
    }
  }, [selectedTrigger, selectedZone, severity, isRunning, addLog, fetchLiveEvents]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setActiveEvent(null);
    setClaimDist({ HIGH: 0, MEDIUM: 0, REVIEW: 0 });
    setTimeline([]);
    setTriggerPassed(null);
    setSelectedTrigger(null);
  };

  const hasFired = activeEvent !== null || (triggerPassed === false && timeline.length > 0);

  return (
    <div className="zyro-root font-sans">
      <div className="zyro-atmosphere" />

      <div className="zyro-container pb-32" style={{ overflowY: "auto" }}>
        <div className="px-6 pt-12 pb-8 space-y-7 relative z-10">

          {/* ── Header ────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-[#1B4965] shadow-lg active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-black text-[#1B4965] tracking-tight uppercase">Trigger Center</h1>
              <p className="text-[10px] font-bold text-[#62B6CB] uppercase tracking-widest">Parametric Simulation</p>
            </div>
            {hasFired && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/60 border border-white/60 text-[9px] font-black uppercase tracking-wider text-[#1B4965]/50 active:scale-95 transition-all"
              >
                <RefreshCw size={11} /> Reset
              </button>
            )}
          </div>

          {/* ── Info box ──────────────────────────────────────────────────── */}
          <div className="bg-white/40 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-white/60 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF6B35] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#1B4965]/70 leading-relaxed font-semibold italic">
              These controls inject real parametric data into the WIVE Engine — triggering the full claim pipeline end-to-end.
            </p>
          </div>

          {/* ── Zone + Severity ───────────────────────────────────────────── */}
          <div className="bg-white/40 backdrop-blur-sm rounded-[24px] p-5 border border-white/60 space-y-4">
            <h3 className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-[0.2em]">Parameters</h3>

            {/* Zone */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-wider ml-1">Zone</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                disabled={isRunning}
                className="w-full bg-white border border-white/60 rounded-xl px-4 py-2.5 text-sm font-bold text-[#1B4965] focus:outline-none focus:ring-2 focus:ring-[#62B6CB] disabled:opacity-50"
              >
                {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>

            {/* Severity */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-wider ml-1">Severity</label>
                <span className="text-[11px] font-black text-[#62B6CB]">{severity.toFixed(1)}×</span>
              </div>
              <input
                type="range" min="1.0" max="2.0" step="0.1"
                value={severity}
                onChange={(e) => setSeverity(parseFloat(e.target.value))}
                disabled={isRunning}
                className="w-full accent-[#62B6CB] disabled:opacity-50"
              />
              <div className="flex justify-between text-[8px] font-bold text-[#1B4965]/20 uppercase">
                <span>Low 1.0×</span><span>High 2.0×</span>
              </div>
            </div>
          </div>

          {/* ── Trigger Grid ──────────────────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-[0.2em] px-2">Select Trigger</h3>
            {TRIGGERS.map((t) => {
              const isSelected = selectedTrigger === t.id;
              const isLoading  = isRunning && isSelected;
              return (
                <motion.div
                  key={t.id}
                  whileTap={{ scale: isRunning ? 1 : 0.98 }}
                  onClick={() => !isRunning && setSelectedTrigger(t.id)}
                  className={`rounded-[22px] p-5 border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#1B4965] border-[#1B4965] shadow-xl"
                      : "bg-white/60 backdrop-blur-sm border-white/60 hover:bg-white/80"
                  } ${isRunning && !isSelected ? "opacity-40 pointer-events-none" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shadow-inner"
                      style={{
                        backgroundColor: isSelected ? `${t.color}30` : `${t.color}15`,
                        color: t.color,
                      }}
                    >
                      {React.cloneElement(t.icon as React.ReactElement, { size: 22 })}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isSelected ? "text-white" : "text-[#1B4965]"}`}>{t.label}</h4>
                      <p className={`text-[9px] font-semibold uppercase tracking-tighter ${isSelected ? "text-white/40" : "text-[#1B4965]/40"}`}>{t.desc}</p>
                    </div>
                  </div>
                  <div>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#62B6CB]" />
                    ) : isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#62B6CB] flex items-center justify-center">
                        <Check size={11} strokeWidth={3} className="text-white" />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#1B4965]/10" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Fire Button ───────────────────────────────────────────────── */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSimulate}
            disabled={!selectedTrigger || isRunning}
            className={`w-full h-14 rounded-[24px] flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest shadow-xl transition-all ${
              selectedTrigger && !isRunning
                ? "bg-[#1B4965] text-white active:scale-[0.98]"
                : "bg-[#1B4965]/20 text-[#1B4965]/30 cursor-not-allowed"
            }`}
          >
            {isRunning ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Running Pipeline...</>
            ) : (
              <><Zap className="w-5 h-5 fill-current" /> Launch Simulation</>
            )}
          </motion.button>

          {/* ── Claim Distribution ────────────────────────────────────────── */}
          <AnimatePresence>
            {(claimDist.HIGH + claimDist.MEDIUM + claimDist.REVIEW) > 0 && (
              <motion.div
                key="dist"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#1B4965] rounded-[28px] p-6 text-white space-y-5"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[#62B6CB]" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">WIVE Claim Routing</h3>
                </div>

                {[
                  { lane: "HIGH",   count: claimDist.HIGH,   color: "#00FF87", label: "Instant Payout" },
                  { lane: "MEDIUM", count: claimDist.MEDIUM, color: "#F39C12", label: "Delayed Verify" },
                  { lane: "REVIEW", count: claimDist.REVIEW, color: "#FF6B35", label: "Fraud Review" },
                ].map(({ lane, count, color, label }) => {
                  const total = claimDist.HIGH + claimDist.MEDIUM + claimDist.REVIEW;
                  const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={lane} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider"
                            style={{ background: `${color}20`, color }}
                          >
                            {lane}
                          </span>
                          <span className="text-[10px] font-bold text-white/40">{label}</span>
                        </div>
                        <span className="text-[13px] font-black" style={{ color }}>{count} claims</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                    </div>
                  );
                })}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/dashboard")}
                  className="w-full h-11 bg-[#62B6CB]/20 border border-[#62B6CB]/30 rounded-xl text-[#62B6CB] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 mt-2"
                >
                  <TrendingUp size={13} /> View Dashboard
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Timeline Log ──────────────────────────────────────────────── */}
          <AnimatePresence>
            {timeline.length > 0 && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <h3 className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.2em] px-2">Pipeline Timeline</h3>
                <div
                  ref={timelineRef}
                  className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-hide"
                >
                  {timeline.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i < 3 ? 0 : 0.05 }}
                      className={`bg-white/40 backdrop-blur-sm rounded-[16px] px-4 py-3 border flex items-start gap-3 ${
                        entry.type === "error"
                          ? "border-[#FF6B35]/30 bg-[#FF6B35]/5"
                          : entry.type === "success"
                          ? "border-[#00FF87]/20"
                          : "border-white/60"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {entry.type === "success"     && <Check size={12} className="text-[#00FF87]" strokeWidth={3} />}
                        {entry.type === "error"       && <X size={12} className="text-[#FF6B35]" strokeWidth={3} />}
                        {entry.type === "processing"  && <Loader2 size={12} className="text-[#62B6CB] animate-spin" />}
                        {entry.type === "info"        && <Activity size={12} className="text-[#1B4965]/40" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-[#1B4965] leading-tight">{entry.label}</p>
                        {entry.detail && (
                          <p className="text-[9px] text-[#1B4965]/40 font-medium mt-0.5 truncate">{entry.detail}</p>
                        )}
                      </div>
                      <span className="text-[8px] font-mono text-[#1B4965]/20 flex-shrink-0">{entry.time}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Live Events Panel ─────────────────────────────────────────── */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-[0.2em]">Live Node Status</h3>
              <div className="flex items-center gap-1.5">
                {fetchingLive && <Loader2 className="w-3 h-3 animate-spin text-[#62B6CB]" />}
                {liveEvents.length > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
                    <span className="text-[8px] font-black text-[#FF6B35] uppercase tracking-wider">
                      {liveEvents.length} active
                    </span>
                  </div>
                )}
              </div>
            </div>

            {liveEvents.length > 0 ? (
              <div className="space-y-2">
                {liveEvents.map((ev) => (
                  <motion.div
                    key={ev.event_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/40 rounded-[20px] p-4 border border-white/60 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse shadow-[0_0_8px_rgba(0,255,135,0.6)]" />
                      <div>
                        <div className="text-[11px] font-black text-[#1B4965] uppercase">{ev.trigger_type.replace(/_/g, " ")}</div>
                        <div className="text-[9px] text-[#1B4965]/40 font-bold">{ev.zone} · {ev.severity.toFixed(1)}×</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-[#1B4965]/25 uppercase">
                      {new Date(ev.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white/20 rounded-[28px] border-2 border-dashed border-white/40">
                <p className="text-[10px] font-bold text-[#1B4965]/30 uppercase tracking-[0.2em]">All Systems Nominal</p>
                <p className="text-[9px] text-[#1B4965]/20 mt-1">No active disruptions detected</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Utility ──────────────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
