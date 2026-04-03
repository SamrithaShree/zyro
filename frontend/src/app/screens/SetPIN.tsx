import { useState } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, Lock, Delete } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

const KEYPAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
];

export function SetPIN() {
  const navigate = useNavigate();
  const [pin, setPin] = useState<string[]>([]);
  const [confirmPin, setConfirmPin] = useState<string[]>([]);
  const [stage, setStage] = useState<"set" | "confirm">("set");
  const [error, setError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);

  const currentPin = stage === "set" ? pin : confirmPin;
  const setCurrentPin = stage === "set" ? setPin : setConfirmPin;

  const handleKey = (key: string) => {
    if (key === "⌫") {
      setCurrentPin((prev) => prev.slice(0, -1));
      setError(null);
      return;
    }
    if (currentPin.length >= 4) return;
    const next = [...currentPin, key];
    setCurrentPin(next);
    setError(null);

    if (next.length === 4) {
      setTimeout(() => {
        if (stage === "set") {
          setStage("confirm");
        } else {
          // Confirm stage complete
          if (next.join("") === pin.join("")) {
            navigate("/activity-consent");
          } else {
            setShaking(true);
            setTimeout(() => setShaking(false), 500);
            setError("PINs don't match. Try again.");
            setConfirmPin([]);
          }
        }
      }, 150);
    }
  };

  const dots = Array.from({ length: 4 }, (_, i) => i);

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        {/* Back */}
        <button
          onClick={() => navigate("/verify-otp")}
          className="flex items-center gap-2 text-muted-foreground mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">Step 1 of 6</span>
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg,#FFA726,#00E5FF)" }}
                initial={{ width: "0%" }}
                animate={{ width: "16.7%" }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center"
        >
          {/* Icon */}
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="text-center mb-10"
            >
              <h1 className="text-2xl font-bold mb-2">
                {stage === "set" ? "Set your 4-digit PIN" : "Confirm your PIN"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {stage === "set"
                  ? "This PIN keeps your account safe"
                  : "Enter the same PIN again to confirm"}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* PIN Dots */}
          <motion.div
            className="flex gap-4 mb-4"
            animate={shaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            {dots.map((i) => {
              const filled = i < currentPin.length;
              return (
                <motion.div
                  key={i}
                  animate={{
                    scale: filled ? 1 : 0.85,
                    backgroundColor: filled ? "#FFA726" : "rgba(255,255,255,0.08)",
                    borderColor: filled ? "#FFA726" : "rgba(255,255,255,0.15)",
                  }}
                  transition={{ duration: 0.15 }}
                  className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center"
                >
                  {filled && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-4 h-4 rounded-full bg-background"
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-destructive text-center mb-4"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Numeric Keypad */}
          <div className="w-full max-w-xs mt-6 space-y-3">
            {KEYPAD.map((row, ri) => (
              <div key={ri} className="grid grid-cols-3 gap-3">
                {row.map((key, ki) => (
                  <button
                    key={ki}
                    onClick={() => key && handleKey(key)}
                    disabled={!key}
                    className={`h-16 rounded-2xl font-semibold text-xl transition-all active:scale-95 ${
                      !key
                        ? "opacity-0 pointer-events-none"
                        : key === "⌫"
                        ? "bg-card border border-border text-muted-foreground hover:border-accent/50"
                        : "bg-card border border-border hover:border-accent/50 hover:bg-card"
                    }`}
                  >
                    {key === "⌫" ? (
                      <span className="flex items-center justify-center">
                        <Delete className="w-5 h-5" />
                      </span>
                    ) : (
                      key
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Skip */}
        <button
          onClick={() => navigate("/activity-consent")}
          className="w-full text-sm text-center text-muted-foreground mt-4 py-2 hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
      </div>
    </MobileContainer>
  );
}
