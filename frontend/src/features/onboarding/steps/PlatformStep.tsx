import React, { useState } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { StickyCTA } from "../../../design-system/layouts/StickyCTA";
import { Button } from "../../../design-system/components/Button";
import { SelectionCard } from "../../../design-system/components/SelectionCard";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, BadgeCheck } from "lucide-react";

const PLATFORMS = ["Swiggy", "Zomato", "UberEats"];

const PLATFORM_META: Record<string, { placeholder: string; prefix: string; color: string }> = {
  Swiggy:   { placeholder: "e.g. SWG-12345", prefix: "SWG-", color: "#FF6B35" },
  Zomato:   { placeholder: "e.g. ZMT-98765", prefix: "ZMT-", color: "#E23744" },
  UberEats: { placeholder: "e.g. UBR-56789", prefix: "UBR-", color: "#06C167" },
  Other:    { placeholder: "e.g. PLT-00001", prefix: "",      color: "#62B6CB" },
};

type VerifyState = "idle" | "verifying" | "verified";

export function PlatformStep() {
  const { data, updateData, nextStep } = useOnboardingStore();

  const [showOther, setShowOther] = useState(
    data.platform !== "" && !PLATFORMS.includes(data.platform)
  );
  const [otherValue, setOtherValue] = useState(showOther ? data.platform : "");
  const [workerIdInput, setWorkerIdInput] = useState(data.workerId ?? "");
  const [verifyState, setVerifyState] = useState<VerifyState>(
    data.workerId ? "verified" : "idle"
  );

  const activePlatform = showOther ? otherValue : data.platform;
  const meta = PLATFORM_META[activePlatform] ?? PLATFORM_META["Other"];

  const handleSelect = (p: string) => {
    setShowOther(false);
    updateData({ platform: p, workerId: undefined });
    setWorkerIdInput("");
    setVerifyState("idle");
  };

  const handleOtherClick = () => {
    setShowOther(true);
    updateData({ platform: otherValue, workerId: undefined });
    setWorkerIdInput("");
    setVerifyState("idle");
  };

  const handleOtherChange = (val: string) => {
    setOtherValue(val);
    updateData({ platform: val });
    setVerifyState("idle");
  };

  const handleWorkerIdChange = (val: string) => {
    setWorkerIdInput(val);
    setVerifyState("idle");
    updateData({ workerId: val.trim() || undefined });
  };

  // Mock verification — any non-empty ID passes after a 1.2s spinner
  const handleVerify = () => {
    if (!workerIdInput.trim()) return;
    setVerifyState("verifying");
    setTimeout(() => {
      const finalId = workerIdInput.trim();
      updateData({ workerId: finalId });
      setVerifyState("verified");
    }, 1200);
  };

  const isComplete =
    activePlatform.trim().length > 0 &&
    verifyState === "verified";

  return (
    <div className="space-y-4">
      {/* ── Platform Selector ── */}
      {PLATFORMS.map((p) => (
        <SelectionCard
          key={p}
          selected={data.platform === p && !showOther}
          onClick={() => handleSelect(p)}
        >
          {p}
        </SelectionCard>
      ))}

      <SelectionCard selected={showOther} onClick={handleOtherClick}>
        Other
      </SelectionCard>

      <AnimatePresence>
        {showOther && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-2">
              <input
                type="text"
                placeholder="Enter platform name"
                value={otherValue}
                autoFocus
                onChange={(e) => handleOtherChange(e.target.value)}
                className="w-full h-16 px-6 bg-[#F4FBFB] rounded-[20px] text-[18px] font-bold text-[#1B4965] placeholder:text-[#1B4965]/20 shadow-[0_4px_20px_rgba(27,73,101,0.08)] focus:ring-2 focus:ring-[#62B6CB] focus:ring-offset-2 outline-none transition-all"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Worker ID Input (appears after platform chosen) ── */}
      <AnimatePresence>
        {activePlatform.trim().length > 0 && (
          <motion.div
            key={`worker-id-${activePlatform}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 pt-2"
          >
            {/* Label */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <span className="text-[11px] font-black text-[#1B4965]/50 uppercase tracking-[0.2em]">
                  {activePlatform} Worker ID
                </span>
              </div>
              {verifyState === "verified" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1"
                >
                  <BadgeCheck className="w-4 h-4 text-[#00CC6B]" />
                  <span className="text-[10px] font-black text-[#00CC6B] uppercase tracking-wider">Verified</span>
                </motion.div>
              )}
            </div>

            {/* Input + verify button row */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                {/* Prefix badge */}
                {meta.prefix && (
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-black uppercase tracking-widest px-2 py-1 rounded-md"
                    style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                  >
                    {meta.prefix.replace(/-$/, "")}
                  </div>
                )}
                <input
                  type="text"
                  placeholder={meta.placeholder}
                  value={workerIdInput}
                  onChange={(e) => handleWorkerIdChange(e.target.value)}
                  disabled={verifyState === "verified"}
                  className={`w-full h-16 rounded-[20px] text-[16px] font-bold text-[#1B4965] placeholder:text-[#1B4965]/20 shadow-[0_4px_20px_rgba(27,73,101,0.08)] focus:ring-2 focus:ring-offset-2 outline-none transition-all disabled:opacity-60 ${
                    meta.prefix ? "pl-16 pr-5" : "px-6"
                  } ${
                    verifyState === "verified"
                      ? "bg-[#00CC6B]/5 focus:ring-[#00CC6B]"
                      : "bg-[#F4FBFB] focus:ring-[#62B6CB]"
                  }`}
                />
              </div>

              {/* Verify / verified button */}
              {verifyState !== "verified" && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleVerify}
                  disabled={!workerIdInput.trim() || verifyState === "verifying"}
                  className="h-16 px-5 rounded-[20px] font-black text-[12px] uppercase tracking-widest transition-all disabled:opacity-30 flex items-center justify-center gap-2 min-w-[90px] shadow-lg active:scale-95"
                  style={{
                    background: workerIdInput.trim() ? meta.color : "#E5F4F5",
                    color: workerIdInput.trim() ? "white" : "#1B4965",
                  }}
                >
                  {verifyState === "verifying" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </motion.button>
              )}

              {verifyState === "verified" && (
                <div className="h-16 w-16 rounded-[20px] bg-[#00CC6B]/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-[#00CC6B]" />
                </div>
              )}
            </div>

            {/* Helper text */}
            <AnimatePresence mode="wait">
              {verifyState === "idle" && workerIdInput.trim() === "" && (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] font-bold text-[#1B4965]/30 italic px-1"
                >
                  Find your Worker ID in the {activePlatform} Partner app under Profile → My ID.
                </motion.p>
              )}
              {verifyState === "verified" && (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] font-black text-[#00CC6B]/80 italic px-1 uppercase tracking-wide"
                >
                  ✓ Worker ID linked to this policy.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <StickyCTA>
        <Button onClick={async () => {
          // Sync with backend to keep session warm
          await useOnboardingStore.getState().syncWithBackend();
          nextStep();
        }} disabled={!isComplete}>
          Continue
        </Button>
      </StickyCTA>
    </div>
  );
}
