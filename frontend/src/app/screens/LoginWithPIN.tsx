import { useState, useRef } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, KeyRound, Smartphone, Delete } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../../store/useAuthStore";

type LoginMode = "pin" | "otp";

const KEYPAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
];

export function LoginWithPIN() {
  const navigate = useNavigate();
  const phone = useAuthStore((s) => s.phone);
  const [mode, setMode] = useState<LoginMode>("pin");

  // PIN mode state
  const [pin, setPin] = useState<string[]>([]);

  // OTP mode state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const switchMode = (m: LoginMode) => {
    setMode(m);
    setPin([]);
    setOtp(["", "", "", "", "", ""]);
  };

  // keypad for PIN
  const handlePinKey = (key: string) => {
    if (key === "⌫") {
      setPin((prev) => prev.slice(0, -1));
      return;
    }
    if (pin.length >= 4) return;
    const next = [...pin, key];
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => navigate("/activity-consent"), 300);
    }
  };

  // OTP inputs
  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOTPKey = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
              <KeyRound className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Sign in to your Zyro account
            </p>
          </div>

          {/* Toggle */}
          <div className="flex gap-2 mb-8 p-1 bg-card rounded-xl border border-border">
            {(["pin", "otp"] as LoginMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${
                  mode === m
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "pin" ? "PIN Login" : "OTP Login"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === "pin" ? (
              <motion.div
                key="pin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* PIN dots */}
                <div className="flex justify-center gap-4 mb-6">
                  {Array.from({ length: 4 }, (_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: i < pin.length ? 1 : 0.85,
                        backgroundColor:
                          i < pin.length ? "#FFA726" : "rgba(255,255,255,0.08)",
                        borderColor:
                          i < pin.length ? "#FFA726" : "rgba(255,255,255,0.15)",
                      }}
                      transition={{ duration: 0.15 }}
                      className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center"
                    >
                      {i < pin.length && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4 rounded-full bg-background"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Keypad */}
                <div className="space-y-3">
                  {KEYPAD.map((row, ri) => (
                    <div key={ri} className="grid grid-cols-3 gap-3">
                      {row.map((key, ki) => (
                        <button
                          key={ki}
                          onClick={() => key && handlePinKey(key)}
                          disabled={!key}
                          className={`h-16 rounded-2xl font-semibold text-xl transition-all active:scale-95 ${
                            !key
                              ? "opacity-0 pointer-events-none"
                              : key === "⌫"
                              ? "bg-card border border-border text-muted-foreground"
                              : "bg-card border border-border hover:border-accent/50"
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

                <button
                  onClick={() => navigate("/login")}
                  className="w-full text-center text-sm text-accent font-medium mt-6"
                >
                  Forgot PIN? Reset via OTP →
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Phone display */}
                <div className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">+91 {phone || "—"}</p>
                  </div>
                  <button
                    onClick={() => navigate("/login")}
                    className="ml-auto text-xs text-accent"
                  >
                    Change
                  </button>
                </div>

                {/* OTP boxes */}
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enter the 6-digit OTP sent to your number
                  </p>
                  <div className="flex gap-2 justify-center">
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleOTPChange(i, e.target.value)}
                        onKeyDown={(e) => handleOTPKey(i, e)}
                        className="w-11 h-14 bg-card border border-border rounded-xl text-center text-xl font-semibold focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                        aria-label={`OTP digit ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/activity-consent")}
                  disabled={!otp.every(Boolean)}
                  className="w-full h-14 bg-primary text-primary-foreground disabled:opacity-50"
                >
                  Verify &amp; Sign In
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </MobileContainer>
  );
}
