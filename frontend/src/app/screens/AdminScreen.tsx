import React, { useState, useEffect, useRef, useMemo } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { apiService } from "../../services/api";
import { Button } from "../../design-system/components/Button";
import { toast } from "sonner";
import {
  Loader2,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Zap,
  RefreshCw,
  CloudRain,
  Thermometer,
  Wind,
  Shield,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  UIAdminMetrics,
  UIActiveEvent,
  mapClaimsSummary,
  mapClaimsForDistribution,
  mapActiveEvents,
  mergeMetrics,
  reserveColor,
  confidenceLaneColor,
} from "../../adapters/adminAdapter";

// ─── Component ────────────────────────────────────────────────────────────────
export function AdminScreen() {
  const [metrics, setMetrics]     = useState<UIAdminMetrics | null>(null);
  const [loading, setLoading]     = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [simulating, setSimulating]   = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulation form state
  const [zone, setZone]               = useState("Anna Nagar");
  const [triggerType, setTriggerType] = useState("HEAVY_RAIN");
  const [severity, setSeverity]       = useState(1.2);

  // ── Fetch → Transform → Store ──────────────────────────────────────────────
  const fetchMetrics = async () => {
    const [summaryRes, eventsRes, claimsRes] = await Promise.allSettled([
      apiService.claims.getSummary(),
      apiService.events.getActive(),
      apiService.claims.getMyClaims(),
    ]);

    const summaryRaw = summaryRes.status === "fulfilled" ? summaryRes.value.data : null;
    const eventsRaw  = eventsRes.status  === "fulfilled" ? eventsRes.value.data  : null;
    const claimsRaw  = claimsRes.status  === "fulfilled" ? claimsRes.value.data  : [];

    const summaryPart  = mapClaimsSummary(summaryRaw);
    const distPart     = mapClaimsForDistribution(Array.isArray(claimsRaw) ? claimsRaw : []);
    const events       = mapActiveEvents(eventsRaw);
    const totalPayout  = Number(summaryRaw?.total_payout ?? 0);

    setMetrics(mergeMetrics(summaryPart, distPart, events, totalPayout));
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh toggle
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchMetrics, 5000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Simulate ───────────────────────────────────────────────────────────────
  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await apiService.events.simulate({
        zone,
        trigger_type: triggerType,
        severity,
        source: "ADMIN_CONSOLE",
        description: `Simulated ${triggerType} in ${zone}`,
      });
      if (res.data?.status === "SUCCESS" || res.status === 200) {
        toast.success(`${triggerType.replace(/_/g, " ")} triggered in ${zone}`);
        setTimeout(fetchMetrics, 1500);
      }
    } catch {
      toast.error("Simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  // ── Derived (outside JSX) ──────────────────────────────────────────────────
  const confidenceTotal = useMemo(() => {
    if (!metrics) return 0;
    return metrics.confidence_distribution.HIGH
      + metrics.confidence_distribution.MEDIUM
      + metrics.confidence_distribution.REVIEW;
  }, [metrics]);

  const confPct = (count: number) =>
    confidenceTotal > 0 ? Math.round((count / confidenceTotal) * 100) : 0;

  const resColor = metrics ? reserveColor(metrics.reserve_utilization) : '#62B6CB';

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <MobileContainer style={{ backgroundColor: "#1B4965" }}>
        <div className="flex flex-col items-center justify-center min-h-screen text-white gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#62B6CB]" />
          <p className="font-bold uppercase tracking-widest text-[10px] opacity-50">Loading Admin Console</p>
        </div>
      </MobileContainer>
    );
  }

  const m = metrics!;

  return (
    <MobileContainer style={{ backgroundColor: "#F4FBFB" }}>
      <div className="px-6 pt-10 pb-24 space-y-7">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="flex items-start justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-[#62B6CB] uppercase tracking-[0.2em]">
              System Control
            </span>
            <h1 className="text-[26px] font-black text-[#1B4965] tracking-tight italic">
              Admin Panel
            </h1>
            {lastUpdated && (
              <p className="text-[9px] text-[#1B4965]/30 font-bold uppercase tracking-wider">
                Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            )}
          </div>
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
              autoRefresh
                ? "bg-[#62B6CB]/15 border-[#62B6CB]/30 text-[#62B6CB]"
                : "bg-white/60 border-white/60 text-[#1B4965]/30"
            }`}
          >
            {autoRefresh ? <><Pause size={11} />Live</> : <><Play size={11} />Paused</>}
          </button>
        </header>

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            icon={<Activity size={18} className="text-[#62B6CB]" />}
            label="Total Claims"
            value={m.total_claims}
            sub={`${m.paid_claims} paid · ${m.processing_claims} processing`}
          />
          <KpiCard
            icon={<TrendingUp size={18} className="text-[#00FF87]" />}
            label="Total Payout"
            value={`₹${m.total_payout.toLocaleString('en-IN')}`}
            sub={`${m.payout_ratio}% of premium pool`}
            accent="#00FF87"
          />
          <KpiCard
            icon={<AlertTriangle size={18} className="text-[#FF6B35]" />}
            label="Fraud Alerts"
            value={m.fraud_under_review}
            sub="claims under review"
            accent="#FF6B35"
          />
          <KpiCard
            icon={<ShieldCheck size={18} style={{ color: resColor }} />}
            label="Reserve Used"
            value={`${m.reserve_utilization}%`}
            sub={m.reserve_utilization > 100 ? "⚠ Reinsurance triggered" : "of weekly pool"}
            accent={resColor}
          />
        </div>

        {/* ── Confidence Distribution ─────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[28px] p-6 border border-[#1B4965]/5 shadow-sm space-y-5"
        >
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#62B6CB]" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#1B4965]/60">
              Confidence Distribution
            </h2>
          </div>

          {(["HIGH", "MEDIUM", "REVIEW"] as const).map((lane) => {
            const count = m.confidence_distribution[lane];
            const pct   = confPct(count);
            const color = confidenceLaneColor(lane);
            return (
              <div key={lane} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider"
                      style={{ background: `${color}20`, color }}
                    >
                      {lane}
                    </span>
                    <span className="text-[11px] font-black text-[#1B4965]">{count}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#1B4965]/40">{pct}%</span>
                </div>
                <div className="h-2 bg-[#1B4965]/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
              </div>
            );
          })}
        </motion.section>

        {/* ── Reserve Pool ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#1B4965] rounded-[28px] p-6 text-white space-y-5"
        >
          <h2 className="text-[11px] font-black uppercase tracking-[0.15em] opacity-50">
            Reserve Pool Tracker
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/8 rounded-[18px] p-4 space-y-1">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-wider block">Weekly Premium</span>
              <span className="text-[17px] font-black text-[#62B6CB]">
                ₹{m.weekly_premium.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-white/8 rounded-[18px] p-4 space-y-1">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-wider block">Weekly Payout</span>
              <span className="text-[17px] font-black" style={{ color: resColor }}>
                ₹{m.weekly_payout.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Utilization bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Utilization</span>
              <span className="text-[13px] font-black" style={{ color: resColor }}>
                {m.reserve_utilization}%
              </span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(m.reserve_utilization, 100)}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: resColor }}
              />
            </div>
            {m.reserve_utilization > 100 && (
              <p className="text-[10px] font-black text-[#FF6B35] uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle size={10} /> Reinsurance automatically triggered
              </p>
            )}
          </div>
        </motion.section>

        {/* ── Active Events ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#1B4965]/50">
              Active Disruptions
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
              <span className="text-[9px] font-black text-[#FF6B35] uppercase tracking-wider">
                {m.active_events.length} live
              </span>
            </div>
          </div>

          {m.active_events.length > 0 ? (
            <div className="space-y-3">
              {m.active_events.map((ev) => (
                <EventCard key={ev.event_id} event={ev} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[24px] p-10 border border-[#1B4965]/5 text-center shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-[#00FF87] mx-auto mb-3" />
              <p className="text-[13px] font-black text-[#1B4965]/40 uppercase tracking-wider">No active disruptions</p>
              <p className="text-[11px] text-[#1B4965]/25 mt-1">WIVE sensors are monitoring all zones</p>
            </div>
          )}
        </motion.section>

        {/* ── Simulation Controls ──────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-[#1B4965] rounded-[32px] p-7 text-white space-y-6 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center">
              <AlertTriangle size={18} className="text-[#FF6B35]" />
            </div>
            <div>
              <h2 className="text-[16px] font-black italic tracking-tight">Simulate Disruption</h2>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Admin trigger panel</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Zone */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-white/40 ml-1">Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#62B6CB]"
              >
                {["Anna Nagar", "T Nagar", "Adyar", "Velachery", "Tambaram", "Guindy"].map((z) => (
                  <option key={z} value={z} className="text-black">{z}</option>
                ))}
              </select>
            </div>

            {/* Trigger */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-white/40 ml-1">Trigger Type</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#62B6CB]"
              >
                {[
                  ["HEAVY_RAIN", "Heavy Rain"],
                  ["EXTREME_HEAT", "Extreme Heat"],
                  ["SEVERE_AQI", "Severe AQI"],
                  ["TRAFFIC_DISRUPTION", "Traffic Disruption"],
                  ["PLATFORM_DOWNTIME", "Platform Downtime"],
                ].map(([val, label]) => (
                  <option key={val} value={val} className="text-black">{label}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-white/40 ml-1">
                Severity Multiplier — {severity.toFixed(1)}x
              </label>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={severity}
                onChange={(e) => setSeverity(parseFloat(e.target.value))}
                className="w-full accent-[#62B6CB]"
              />
              <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase tracking-wide px-0.5">
                <span>Low 1.0×</span>
                <span>High 2.0×</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSimulate}
            disabled={simulating}
            className="w-full h-14 rounded-2xl bg-[#62B6CB] text-white font-black text-sm uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all"
          >
            {simulating ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Trigger Simulation"
            )}
          </Button>
        </motion.section>

      </div>
    </MobileContainer>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

function KpiCard({ icon, label, value, sub, accent = '#62B6CB' }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[22px] p-5 border border-[#1B4965]/5 shadow-sm space-y-2"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-[22px] font-black text-[#1B4965] leading-none" style={{ color: accent !== '#62B6CB' ? accent : undefined }}>
        {value}
      </div>
      {sub && (
        <p className="text-[9px] font-bold text-[#1B4965]/30 uppercase tracking-wide leading-tight">{sub}</p>
      )}
    </motion.div>
  );
}

function EventCard({ event }: { event: UIActiveEvent }) {
  const triggerIcon: Record<string, React.ReactNode> = {
    HEAVY_RAIN:         <CloudRain size={16} />,
    EXTREME_HEAT:       <Thermometer size={16} />,
    SEVERE_AQI:         <Wind size={16} />,
    TRAFFIC_DISRUPTION: <AlertTriangle size={16} />,
    PLATFORM_DOWNTIME:  <XCircle size={16} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-[22px] p-5 border border-[#FF6B35]/15 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] flex-shrink-0">
            {triggerIcon[event.trigger_type] ?? <Zap size={16} />}
          </div>
          <div>
            <h4 className="text-[12px] font-black text-[#1B4965] uppercase tracking-tight">
              {event.trigger_type.replace(/_/g, " ")}
            </h4>
            <p className="text-[10px] text-[#1B4965]/40 font-bold">{event.zone}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[11px] font-black text-[#FF6B35]">{event.severity.toFixed(1)}×</div>
          <div className="text-[9px] text-[#1B4965]/30 font-bold">{event.affected_workers} workers</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[#1B4965]/5 flex items-center justify-between">
        <span className="text-[8px] font-black text-[#1B4965]/30 uppercase tracking-wider">Started</span>
        <span className="text-[9px] font-bold text-[#1B4965]/50">
          {new Date(event.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
