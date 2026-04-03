import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useOnboardingStore, Platform } from "../../store/useOnboardingStore";

/* ─────────────────────────────────────────
   Brand Logo SVGs — exact brand colors
───────────────────────────────────────── */

const SwiggyLogo = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="26" fill="#FC8019" />
    {/* Swiggy S mark */}
    <path
      d="M33 18c0-2.8-2.8-5-7-5s-7 2.2-7 5c0 2.4 1.8 4.2 5 5l4 1.2c2.6.8 4 2.4 4 4.4 0 2.8-2.8 5-7 5s-7-2.2-7-5"
      stroke="white"
      strokeWidth="3.2"
      strokeLinecap="round"
      fill="none"
    />
    <line x1="26" y1="11" x2="26" y2="14" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <line x1="26" y1="38" x2="26" y2="41" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const ZomatoLogo = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="26" fill="#E23744" />
    {/* Z shape */}
    <polyline
      points="14,17 38,17 14,35 38,35"
      stroke="white"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const DunzoLogo = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="26" fill="#00A676" />
    {/* D shape */}
    <path
      d="M18 16h7c6 0 10 4 10 10s-4 10-10 10h-7V16z"
      stroke="white"
      strokeWidth="3"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const ZeptoLogo = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="14" fill="#6C3CE1" />
    {/* Lightning bolt */}
    <path
      d="M30 13L18 28h12L22 41"
      stroke="white"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const BlinkitLogo = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="26" fill="#F8CC1B" />
    {/* Flash / B */}
    <path
      d="M18 14h10c3.5 0 6 2 6 5s-2.5 5-6 5H18"
      stroke="#1a1a1a"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M18 24h11c3.5 0 6 2.2 6 5.5S32.5 35 29 35H18"
      stroke="#1a1a1a"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <line x1="18" y1="14" x2="18" y2="35" stroke="#1a1a1a" strokeWidth="3.2" strokeLinecap="round" />
  </svg>
);

const OtherLogo = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="26" fill="rgba(139,146,168,0.18)" />
    <circle cx="26" cy="26" r="25" stroke="rgba(139,146,168,0.35)" strokeWidth="1" fill="none" />
    <circle cx="17" cy="26" r="3" fill="#8B92A8" />
    <circle cx="26" cy="26" r="3" fill="#8B92A8" />
    <circle cx="35" cy="26" r="3" fill="#8B92A8" />
  </svg>
);

const platforms = [
  {
    id: "SWIGGY",
    name: "Swiggy",
    Logo: SwiggyLogo,
    color: "#FC8019",
    glow: "rgba(252,128,25,0.5)",
    cardGlow: "rgba(252,128,25,0.12)",
    borderSelected: "rgba(252,128,25,0.7)",
  },
  {
    id: "ZOMATO",
    name: "Zomato",
    Logo: ZomatoLogo,
    color: "#E23744",
    glow: "rgba(226,55,68,0.5)",
    cardGlow: "rgba(226,55,68,0.12)",
    borderSelected: "rgba(226,55,68,0.7)",
  },
  {
    id: "DUNZO",
    name: "Dunzo",
    Logo: DunzoLogo,
    color: "#00A676",
    glow: "rgba(0,166,118,0.5)",
    cardGlow: "rgba(0,166,118,0.12)",
    borderSelected: "rgba(0,166,118,0.7)",
  },
  {
    id: "ZEPTO",
    name: "Zepto",
    Logo: ZeptoLogo,
    color: "#6C3CE1",
    glow: "rgba(108,60,225,0.5)",
    cardGlow: "rgba(108,60,225,0.12)",
    borderSelected: "rgba(108,60,225,0.7)",
  },
  {
    id: "BLINKIT",
    name: "Blinkit",
    Logo: BlinkitLogo,
    color: "#F8CC1B",
    glow: "rgba(248,204,27,0.5)",
    cardGlow: "rgba(248,204,27,0.12)",
    borderSelected: "rgba(248,204,27,0.7)",
  },
  {
    id: "OTHER",
    name: "Other",
    Logo: OtherLogo,
    color: "#8B92A8",
    glow: "rgba(139,146,168,0.35)",
    cardGlow: "rgba(139,146,168,0.06)",
    borderSelected: "rgba(139,146,168,0.5)",
  },
];

/* ─────────────────────────────────────────
   Animated progress bar
───────────────────────────────────────── */
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="flex items-center gap-3 mb-8">
      <span className="text-xs whitespace-nowrap" style={{ color: "#5A6075" }}>
        Step {step} of {total}
      </span>
      <div
        className="flex-1 h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.07)" }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            background: "linear-gradient(90deg,#FFA726 0%,#00E5FF 100%)",
            boxShadow: "0 0 8px rgba(0,229,255,0.5)",
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Platform Card
───────────────────────────────────────── */
function PlatformCard({
  platform,
  isSelected,
  onToggle,
}: {
  platform: (typeof platforms)[number];
  isSelected: boolean;
  onToggle: () => void;
}) {
  const Logo = platform.Logo;
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.94 }}
      animate={{
        scale: isSelected ? 1.02 : 1,
        boxShadow: isSelected
          ? `0 0 20px ${platform.glow}, 0 4px 24px rgba(0,0,0,0.4)`
          : "0 2px 12px rgba(0,0,0,0.25)",
      }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className="relative rounded-2xl p-4 flex flex-col items-center justify-center gap-3 w-full"
      style={{
        minHeight: 120,
        background: isSelected
          ? `linear-gradient(135deg, ${platform.cardGlow} 0%, rgba(255,255,255,0.04) 100%)`
          : "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: isSelected
          ? `1.5px solid ${platform.borderSelected}`
          : "1.5px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        transition: "border-color 0.2s, background 0.2s",
      }}
    >
      {/* Logo */}
      <motion.div
        animate={{ scale: isSelected ? 1.08 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{
          filter: isSelected ? `drop-shadow(0 0 10px ${platform.glow})` : "none",
        }}
      >
        <Logo />
      </motion.div>

      {/* Platform name */}
      <span
        className="font-semibold text-sm"
        style={{ color: isSelected ? "#FFFFFF" : "#8B92A8" }}
      >
        {platform.name}
      </span>

      {/* Selected tick */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: platform.color,
              boxShadow: `0 0 10px ${platform.glow}`,
            }}
          >
            <Check className="w-3.5 h-3.5" style={{ color: platform.id === "BLINKIT" ? "#1a1a1a" : "white" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ─────────────────────────────────────────
   Main Screen
───────────────────────────────────────── */
export function PlatformSelection() {
  const navigate = useNavigate();
  const setPlatform = useOnboardingStore((s) => s.setPlatform);
  const [selected, setSelected] = useState<string[]>([]);

  const togglePlatform = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      const primaryPlatform = selected[0] as Platform;
      setPlatform(primaryPlatform);
      navigate("/aadhaar-verify");
    }
  };

  const canContinue = selected.length > 0;

  return (
    <MobileContainer>
      <div className="relative flex flex-col min-h-screen overflow-hidden">

        {/* Background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,180,255,0.14) 0%, transparent 65%)," +
              "radial-gradient(ellipse 60% 40% at 90% 100%, rgba(255,140,0,0.10) 0%, transparent 60%)," +
              "linear-gradient(180deg, #080C14 0%, #0F1115 50%, #0A0D12 100%)",
          }}
        />

        <div className="relative flex flex-col min-h-screen px-5 py-8">

          {/* Back button */}
          <button
            onClick={() => navigate("/verify-otp")}
            className="flex items-center gap-2 mb-7 self-start"
            style={{ color: "#5A6075" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          {/* Progress */}
          <ProgressBar step={1} total={4} />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mb-7"
          >
            <h1 className="text-2xl font-bold mb-1.5 text-foreground leading-tight">
              Which platforms do<br />you work on?
            </h1>
            <p className="text-sm" style={{ color: "#5A6075" }}>
              Select all that apply — your coverage will be tailored accordingly
            </p>
          </motion.div>

          {/* Platform Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.45 }}
            className="flex-1 grid grid-cols-2 gap-3 mb-6"
            style={{ alignContent: "start" }}
          >
            {platforms.map((platform, i) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + i * 0.07, duration: 0.35 }}
              >
                <PlatformCard
                  platform={platform}
                  isSelected={selected.includes(platform.id)}
                  onToggle={() => togglePlatform(platform.id)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Selection count hint */}
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-center mb-4"
                style={{ color: "#00E5FF" }}
              >
                {selected.length === 1
                  ? `${platforms.find((p) => p.id === selected[0])?.name} selected`
                  : `${selected.length} platforms selected`}
              </motion.p>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.div
            whileTap={{ scale: 0.975 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <button
              id="platform-continue-btn"
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full h-14 rounded-2xl font-bold text-[15px] relative overflow-hidden transition-all"
              style={{
                background: canContinue
                  ? "linear-gradient(90deg,#FF8C00 0%,#FFA726 40%,#FFD54F 100%)"
                  : "rgba(255,255,255,0.06)",
                color: canContinue ? "#0F1115" : "#3A4055",
                border: canContinue ? "none" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: canContinue
                  ? "0 0 36px rgba(255,167,38,0.4), 0 4px 16px rgba(255,167,38,0.2)"
                  : "none",
                cursor: canContinue ? "pointer" : "not-allowed",
              }}
            >
              {/* Shimmer on active */}
              {canContinue && (
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "linear", repeatDelay: 2 }}
                  className="absolute inset-y-0 pointer-events-none"
                  style={{
                    width: "35%",
                    background:
                      "linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)",
                  }}
                />
              )}
              <span className="relative">Continue →</span>
            </button>
          </motion.div>

          {/* Footer note */}
          <p className="text-center mt-4" style={{ fontSize: "10px", color: "#3A4055" }}>
            Your data is encrypted and never shared with platforms 🔒
          </p>
        </div>
      </div>
    </MobileContainer>
  );
}
