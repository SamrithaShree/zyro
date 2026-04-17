import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ShieldCheck,
  ShieldAlert,
  CloudRain,
  Zap,
  ChevronDown,
  Loader2,
  Check,
  X,
  Wallet,
  ArrowLeft,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiService } from "../../services/api";
import { StickyCTA } from "../../design-system/layouts/StickyCTA";
import { Button } from "../../design-system/components/Button";
import "../../design-system/styles/atmosphere.css";
import { toast } from "sonner";
import {
  UIClaimDetail,
  mapClaimDetail,
  coverageRatio,
  laneColor,
  laneLabel,
  statusColor,
} from "../../adapters/claimDetailAdapter";

// ─── Component ────────────────────────────────────────────────────────────────
export function ClaimDetails() {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate    = useNavigate();

  const [claim, setClaim]               = useState<UIClaimDetail | null>(null);
  const [loading, setLoading]           = useState(true);
  const [executing, setExecuting]       = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["validation", "breakdown"]);

  // ── Fetch → Transform → Store ──────────────────────────────────────────────
  const fetchClaim = async () => {
    if (!claimId) return;
    try {
      const res = await apiService.claims.getClaim(claimId);
      // GET /claims/{id} returns ClaimResponse DIRECTLY (no {status,data} wrapper)
      const raw = res.data;
      if (raw?.claim_id) {
        setClaim(mapClaimDetail(raw));
      }
    } catch (err) {
      console.error("Failed to fetch claim", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
    const interval = setInterval(fetchClaim, 4000);
    return () => clearInterval(interval);
  }, [claimId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-detect paid state
  useEffect(() => {
    if (claim?.status === "PAID" && !payoutSuccess) setPayoutSuccess(true);
  }, [claim?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived (useMemo, not JSX) ─────────────────────────────────────────────
  const coverage   = useMemo(() => claim ? coverageRatio(claim) : 0, [claim]);
  const isPaid     = payoutSuccess || claim?.status === "PAID";
  const canPayout  = !payoutSuccess &&
    (claim?.status === "ELIGIBLE" || claim?.status === "PAYOUT_READY");

  const handleExecutePayout = async () => {
    setExecuting(true);
    try {
      const res = await apiService.claims.payout(claimId!);
      if (res.data?.status === "SUCCESS") {
        setPayoutSuccess(true);
        toast.success("Payout Transferred Successfully");
        setTimeout(() => navigate("/dashboard"), 3000);
      }
    } catch {
      toast.error("Payout execution failed");
    } finally {
      setExecuting(false);
    }
  };

  const toggleSection = (s: string) =>
    setOpenSections((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="zyro-root font-sans">
        <div className="zyro-atmosphere" />
        <div className="zyro-container flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#62B6CB]" />
            <p className="text-[#1B4965]/40 font-bold uppercase tracking-widest text-[10px]">
              Verifying Nodes
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="zyro-root font-sans">
        <div className="zyro-atmosphere" />
        <div className="zyro-container flex items-center justify-center min-h-screen">
          <div className="text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-[#FF6B35] mx-auto" />
            <p className="text-[#1B4965]/60 font-bold uppercase tracking-widest text-[11px]">Claim not found</p>
            <Button onClick={() => navigate("/dashboard")} variant="secondary">Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  const lane     = claim.confidence_lane;
  const theColor = laneColor(lane);
  const sColor   = statusColor(claim.status);

  return (
    <div className="zyro-root font-sans">
      <div className="zyro-atmosphere" />

      <div className="zyro-container pb-36" style={{ overflowY: 'auto' }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="px-6 pt-10 pb-4 flex items-center justify-between relative z-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1B4965] shadow-lg active:scale-95 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-right">
            <span className="text-[10px] font-bold text-[#62B6CB] uppercase tracking-[0.2em]">Resolution</span>
            <p className="text-[12px] font-black text-[#1B4965] tracking-widest uppercase">Determinism Locked</p>
          </div>
        </header>

        <main className="px-6 space-y-5 relative z-10">

          {/* ── Status Banner ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] p-5 border-2 flex items-center justify-between"
            style={{
              background: isPaid ? '#00FF87' : `${sColor}10`,
              borderColor: isPaid ? '#00FF87' : `${sColor}40`,
            }}
          >
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] opacity-50">Current State</span>
              <h2 className="text-[22px] font-black italic uppercase leading-none text-[#1B4965]">
                {isPaid ? "Payout Complete" : claim.status}
              </h2>
            </div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
              style={{ background: isPaid ? '#1B4965' : `${sColor}20` }}
            >
              {isPaid
                ? <Check size={22} strokeWidth={3.5} className="text-[#00FF87]" />
                : <ShieldCheck size={22} style={{ color: sColor }} />
              }
            </div>
          </motion.div>

          {/* ── Payout Card ───────────────────────────────────────────────── */}
          <div className="bg-[#1B4965] rounded-[40px] p-7 text-white shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#62B6CB]/10 rounded-full blur-3xl" />

            {/* Payout + Confidence */}
            <div className="relative z-10 flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[#62B6CB] uppercase tracking-[0.2em]">Benefit Payout</span>
                <div className="text-[48px] font-black italic leading-none text-[#00FF87]">
                  ₹{claim.final_payout.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bg-white/6 px-3 py-2 rounded-xl border border-white/10 text-right">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-0.5">WIVE Score</span>
                <span className="text-[15px] font-black" style={{ color: theColor }}>
                  {(claim.confidence_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="relative z-10 grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-[20px] border border-white/5">
                <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block mb-1">Estimated Loss</span>
                <span className="text-lg font-black">₹{claim.estimated_loss.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-white/5 p-4 rounded-[20px] border border-white/5">
                <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block mb-1">Replacement</span>
                <span className="text-lg font-black">
                  {(claim.protection_ratio * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Coverage bar */}
            <div className="relative z-10 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Coverage</span>
                <span className="text-[12px] font-black text-[#62B6CB]">{coverage}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${coverage}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, #62B6CB, #00FF87)` }}
                />
              </div>
            </div>

            {/* Saved vs Lost */}
            <div className="relative z-10 grid grid-cols-2 gap-3">
              <div className="bg-[#00FF87]/10 p-4 rounded-[18px] border border-[#00FF87]/20">
                <span className="text-[8px] font-black text-[#00FF87]/60 uppercase tracking-wider block mb-1">Saved</span>
                <span className="text-[16px] font-black text-[#00FF87]">
                  ₹{claim.final_payout.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-[#FF6B35]/10 p-4 rounded-[18px] border border-[#FF6B35]/20">
                <span className="text-[8px] font-black text-[#FF6B35]/60 uppercase tracking-wider block mb-1">Uncovered</span>
                <span className="text-[16px] font-black text-[#FF6B35]">
                  ₹{claim.uncovered_loss.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* ── Confidence Lane ───────────────────────────────────────────── */}
          <div
            className="rounded-[24px] p-5 border space-y-2"
            style={{ background: `${theColor}10`, borderColor: `${theColor}30` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-50 text-[#1B4965]">
                Fraud Intelligence Lane
              </span>
              <span
                className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider"
                style={{ background: `${theColor}20`, color: theColor }}
              >
                {lane}
              </span>
            </div>
            <p className="text-[12px] font-bold text-[#1B4965]/70">{laneLabel(lane)}</p>
            {claim.risk_score_snapshot > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[9px] font-black text-[#1B4965]/40 uppercase tracking-wider">Risk Score</span>
                <span className="text-[12px] font-black" style={{ color: theColor }}>
                  {(claim.risk_score_snapshot * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* ── WIVE Analysis Explanation ─────────────────────────────────── */}
          {claim.explanation && (
            <div className="bg-white/40 backdrop-blur-md rounded-[24px] p-5 border border-white/60 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Zap size={13} className="text-[#62B6CB]" fill="currentColor" />
                <span className="text-[9px] font-black text-[#1B4965]/50 uppercase tracking-widest">WIVE Analysis</span>
              </div>
              <p className="text-[13px] font-semibold text-[#1B4965] leading-relaxed line-clamp-3">
                "{claim.explanation}"
              </p>
              {claim.why_eligible && (
                <p className="text-[11px] text-[#62B6CB] font-bold leading-relaxed">
                  {claim.why_eligible}
                </p>
              )}
            </div>
          )}

          {/* ── WIVE Validation Checks ────────────────────────────────────── */}
          <CollapsibleRow
            title="WIVE Validation"
            icon={<ShieldCheck size={17} className="text-[#00FF87]" />}
            isOpen={openSections.includes("validation")}
            onClick={() => toggleSection("validation")}
          >
            <div className="space-y-2.5 pt-3">
              <CheckPoint label="Contract Active"             passed={claim.validation_breakdown.policy_active} />
              <CheckPoint label="Parametric Trigger Covered"  passed={claim.validation_breakdown.trigger_covered} />
              <CheckPoint label="Zone Node Handshake"         passed={claim.validation_breakdown.zone_match} />
              <CheckPoint label="Within Policy Window"        passed={claim.validation_breakdown.within_policy_window} />
              <CheckPoint label="Working Hours Overlap"       passed={claim.validation_breakdown.working_hours_overlap} />
              <CheckPoint label="Earning Intent Detected"     passed={claim.validation_breakdown.earning_intent_detected} />
            </div>
          </CollapsibleRow>

          {/* ── Payout Calculation ────────────────────────────────────────── */}
          <CollapsibleRow
            title="Payout Calculation"
            icon={<CloudRain size={17} />}
            isOpen={openSections.includes("breakdown")}
            onClick={() => toggleSection("breakdown")}
          >
            <div className="space-y-3 pt-3">
              <DataPoint
                label="Impacted Hours"
                value={`${claim.impact_reasoning.final_impacted_hours} hrs`}
              />
              <DataPoint
                label="Estimated Loss"
                value={`₹${claim.estimated_loss.toLocaleString('en-IN')}`}
              />
              <DataPoint
                label="Final Payout"
                value={`₹${claim.final_payout.toLocaleString('en-IN')}`}
              />
              <DataPoint
                label="Protection"
                value={`${(claim.protection_ratio * 100).toFixed(0)}% replacement`}
              />
            </div>
          </CollapsibleRow>

          {/* ── Timestamps ────────────────────────────────────────────────── */}
          <div className="bg-white/30 rounded-[20px] p-4 border border-white/40 space-y-2">
            <DataPoint
              label="Created"
              value={new Date(claim.created_at).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
              })}
            />
            {claim.processed_at && (
              <DataPoint
                label="Processed"
                value={new Date(claim.processed_at).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              />
            )}
          </div>

        </main>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      {!isPaid && (
        <StickyCTA>
          {canPayout ? (
            <Button
              onClick={handleExecutePayout}
              disabled={executing}
              className="h-16 rounded-[24px] shadow-xl flex items-center justify-center gap-3"
            >
              {executing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Wallet size={18} /><span>Authorize Instant Payout</span></>}
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/dashboard")}
              variant="secondary"
              className="h-16 rounded-[24px]"
            >
              Return to Dashboard
            </Button>
          )}
        </StickyCTA>
      )}

      {/* ── Payout Success Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {payoutSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[110] bg-[#00FF87] flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="space-y-8"
            >
              <div className="w-28 h-28 rounded-[40px] bg-[#1B4965] mx-auto flex items-center justify-center shadow-2xl">
                <Check size={52} className="text-[#00FF87]" strokeWidth={4} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-[#1B4965] italic uppercase tracking-tighter">Paid instantly</h2>
                <p className="text-[#1B4965]/60 font-bold uppercase tracking-widest text-xs">
                  ₹{claim.final_payout.toLocaleString('en-IN')} transferred to UPI
                </p>
              </div>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="secondary"
                className="bg-[#1B4965] text-white border-none h-14 rounded-2xl font-bold uppercase"
              >
                Done
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface CollapsibleRowProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function CollapsibleRow({ title, icon, isOpen, onClick, children }: CollapsibleRowProps) {
  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-[24px] border border-white/60 overflow-hidden">
      <button
        onClick={onClick}
        className="w-full px-5 py-4 flex items-center justify-between text-[#1B4965]"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#62B6CB] shadow-sm">
            {icon}
          </div>
          <span className="text-[13px] font-black uppercase tracking-tight">{title}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-[#1B4965]/20 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/20">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-widest">{label}</span>
      <span className="text-[12px] font-bold text-[#1B4965] uppercase tracking-tight">{value}</span>
    </div>
  );
}

function CheckPoint({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${
          passed ? "bg-[#00FF87]/20 text-[#00FF87]" : "bg-[#FF6B35]/15 text-[#FF6B35]"
        }`}
      >
        {passed
          ? <Check size={11} strokeWidth={4} />
          : <X size={11} strokeWidth={4} />
        }
      </div>
      <span
        className={`text-[11px] font-bold uppercase tracking-tighter ${
          passed ? "text-[#1B4965]" : "text-[#1B4965]/35"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
