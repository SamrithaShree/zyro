import { useState, useRef, useEffect } from "react";
import { MobileContainer } from "../components/MobileContainer";
import {
  ArrowLeft,
  Smartphone,
  Delete,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  sendOTP,
  verifyOTP,
  verifyMPIN,
  checkUserExists,
} from "../../services/mock/auth.mock";
import { useAuthStore } from "../../store/useAuthStore";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { toast } from "sonner";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type Step = "phone" | "otp" | "mpin" | "loading";

const KEYPAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
];

/* ─────────────────────────────────────────
   Step indicator strip
───────────────────────────────────────── */
function StepStrip({ step }: { step: Step }) {
  const steps: Step[] = ["phone", "otp", "mpin"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-2 mb-8">
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        Step {Math.max(idx + 1, 1)} / 3
      </span>
      <div className="flex-1 flex gap-1.5">
        {steps.map((s, i) => (
          <motion.div
            key={s}
            className="h-1 flex-1 rounded-full overflow-hidden bg-secondary"
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg,#FFA726,#00E5FF)",
              }}
              initial={{ width: "0%" }}
              animate={{ width: i <= idx ? "100%" : "0%" }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   STEP 1 — Phone
───────────────────────────────────────── */
function PhoneStep({
  onDone,
}: {
  onDone: (phone: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    setError(null);
    try {
      const { exists } = await checkUserExists(phone);
      if (!exists) {
        setError("No account found. Please sign up first.");
        setLoading(false);
        return;
      }
      await sendOTP(phone);
      onDone(phone);
    } catch {
      toast.error("Couldn't send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="phone"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex-1 flex flex-col"
    >
      {/* Icon + header */}
      <div className="mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: "rgba(0,229,255,0.1)" }}
        >
          <Smartphone className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Enter your registered phone number
        </p>
      </div>

      {/* Phone input */}
      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-sm mb-2 text-muted-foreground">
            Phone Number
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 h-14 bg-card rounded-xl border border-border flex-shrink-0">
              <span className="text-foreground font-medium">+91</span>
            </div>
            <Input
              id="signin-phone"
              type="tel"
              placeholder="00000 00000"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 h-14 bg-card border-border text-lg tracking-widest"
              maxLength={10}
              autoFocus
            />
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl p-3 bg-destructive/10 border border-destructive/30 flex items-start gap-2"
            >
              <span className="text-destructive text-xs leading-relaxed">
                {error}{" "}
                {error.includes("sign up") && (
                  <a
                    href="/signup"
                    className="underline font-medium text-primary"
                  >
                    Sign up →
                  </a>
                )}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fine print */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
          <p className="text-xs text-muted-foreground">
            We'll send a 6-digit OTP to verify your identity.
          </p>
        </div>
      </div>

      {/* CTA */}
      <motion.div whileTap={{ scale: 0.97 }} className="mt-6">
        <Button
          id="signin-send-otp"
          onClick={handleSend}
          disabled={phone.length !== 10 || loading}
          className="w-full h-14 rounded-2xl font-bold text-base disabled:opacity-40"
          style={{
            background:
              phone.length === 10
                ? "linear-gradient(90deg,#FFA726,#FFCA28)"
                : undefined,
            color: phone.length === 10 ? "#0F1115" : undefined,
            boxShadow:
              phone.length === 10
                ? "0 0 24px rgba(255,167,38,0.3)"
                : undefined,
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking…
            </span>
          ) : (
            "Send OTP"
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   STEP 2 — OTP
───────────────────────────────────────── */
function OTPStep({
  phone,
  onDone,
}: {
  phone: string;
  onDone: (token: string, name: string) => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSecs, setResendSecs] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  // Resend timer
  useEffect(() => {
    if (resendSecs <= 0) return;
    const t = setTimeout(() => setResendSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSecs]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    setError(null);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every(Boolean) && i === 5) submit(next.join(""));
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      refs.current[i - 1]?.focus();
  };

  const submit = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyOTP(phone, code);
      onDone(res.token, res.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => refs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    await sendOTP(phone);
    setResendSecs(30);
    setOtp(["", "", "", "", "", ""]);
    refs.current[0]?.focus();
    toast.success("New OTP sent!");
  };

  const isComplete = otp.every(Boolean);

  return (
    <motion.div
      key="otp"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex-1 flex flex-col"
    >
      {/* Header */}
      <div className="mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: "rgba(0,255,135,0.1)" }}
        >
          <ShieldCheck className="w-8 h-8" style={{ color: "#00FF87" }} />
        </div>
        <h1 className="text-2xl font-bold mb-1">Verify your number</h1>
        <p className="text-muted-foreground text-sm">
          6-digit OTP sent to{" "}
          <span className="text-foreground font-medium">+91 {phone}</span>
        </p>
      </div>

      {/* OTP boxes */}
      <div className="space-y-5 flex-1">
        <div className="flex gap-2 justify-center">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              className={`w-12 h-14 bg-card border-2 rounded-xl text-center text-xl font-bold focus:outline-none transition-all ${
                error
                  ? "border-destructive"
                  : d
                  ? "border-accent"
                  : "border-border focus:border-accent"
              }`}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-destructive text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Resend */}
        <div className="text-center">
          {resendSecs > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend in{" "}
              <span className="text-foreground font-medium tabular-nums">
                {resendSecs}s
              </span>
            </p>
          ) : (
            <button
              onClick={resend}
              className="text-sm text-accent font-semibold"
            >
              Resend OTP
            </button>
          )}
        </div>

        {/* Auto-filled hint */}
        <AnimatePresence>
          {isComplete && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-success/5 border border-success/20 rounded-xl p-3"
            >
              <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
              <span className="text-sm text-success">
                {loading ? "Verifying…" : "Code complete — tap Verify"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <motion.div whileTap={{ scale: 0.97 }} className="mt-6">
        <Button
          id="signin-verify-otp"
          onClick={() => submit(otp.join(""))}
          disabled={!isComplete || loading}
          className="w-full h-14 rounded-2xl font-bold text-base disabled:opacity-40"
          style={{
            background: isComplete
              ? "linear-gradient(90deg,#FFA726,#FFCA28)"
              : undefined,
            color: isComplete ? "#0F1115" : undefined,
            boxShadow: isComplete ? "0 0 24px rgba(255,167,38,0.3)" : undefined,
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying…
            </span>
          ) : (
            "Verify"
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   STEP 3 — MPIN
───────────────────────────────────────── */
function MPINStep({
  phone,
  onDone,
  onForgot,
}: {
  phone: string;
  onDone: (token: string, name: string) => void;
  onForgot: () => void;
}) {
  const [pin, setPin] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);

  const handleKey = async (key: string) => {
    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
      setError(null);
      return;
    }
    if (pin.length >= 4) return;
    const next = [...pin, key];
    setPin(next);
    setError(null);

    if (next.length === 4) {
      setLoading(true);
      try {
        const res = await verifyMPIN(phone, next.join(""));
        onDone(res.token, res.name);
      } catch (err) {
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
        setError(err instanceof Error ? err.message : "Wrong PIN");
        setPin([]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div
      key="mpin"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex-1 flex flex-col items-center"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto"
          style={{ background: "rgba(255,167,38,0.1)" }}
        >
          <span className="text-3xl">🔐</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">Enter your 4-digit PIN</h1>
        <p className="text-muted-foreground text-sm">
          Your MPIN keeps your account secure
        </p>
      </div>

      {/* PIN dots */}
      <motion.div
        className="flex gap-4 mb-4"
        animate={shaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {Array.from({ length: 4 }, (_, i) => {
          const filled = i < pin.length;
          return (
            <motion.div
              key={i}
              animate={{
                scale: filled ? 1 : 0.85,
                backgroundColor: filled
                  ? "#FFA726"
                  : "rgba(255,255,255,0.06)",
                borderColor: filled
                  ? "#FFA726"
                  : "rgba(255,255,255,0.12)",
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

      {/* Loading spinner while verifying */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying PIN…
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-destructive text-center mb-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Forgot PIN */}
      <button
        onClick={onForgot}
        className="text-sm text-accent font-medium mb-6 hover:underline"
      >
        Forgot PIN? Reset via OTP
      </button>

      {/* Keypad */}
      <div className="w-full max-w-xs space-y-3">
        {KEYPAD.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-3">
            {row.map((key, ki) => (
              <motion.button
                key={ki}
                onClick={() => key && !loading && handleKey(key)}
                disabled={!key || loading}
                whileTap={{ scale: key ? 0.92 : 1 }}
                className={`h-16 rounded-2xl font-semibold text-xl transition-colors ${
                  !key
                    ? "opacity-0 pointer-events-none"
                    : key === "⌫"
                    ? "bg-card border border-border text-muted-foreground hover:border-accent/40"
                    : "bg-card border border-border hover:border-accent/40 active:bg-accent/5"
                }`}
              >
                {key === "⌫" ? (
                  <span className="flex items-center justify-center">
                    <Delete className="w-5 h-5" />
                  </span>
                ) : (
                  key
                )}
              </motion.button>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   STEP 4 — Loading / Fetching Profile
───────────────────────────────────────── */
function LoadingStep({ name }: { name: string }) {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col items-center justify-center text-center gap-6"
    >
      {/* Spinner ring */}
      <div className="relative w-24 h-24">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: "3px solid rgba(0,229,255,0.15)" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: "3px solid transparent",
            borderTopColor: "#FFA726",
            borderRightColor: "#00E5FF",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">⚡</span>
        </div>
      </div>

      <div>
        <p className="text-lg font-semibold text-foreground mb-1">
          Hey, {name}! 👋
        </p>
        <p className="text-sm text-muted-foreground">
          Fetching your profile…
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Root — PhoneLogin (Sign In Flow)
───────────────────────────────────────── */
export function PhoneLogin() {
  const navigate = useNavigate();
  const setPhone = useAuthStore((s) => s.setPhone);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const completeOnboarding = useOnboardingStore((s) => s.complete);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhoneLocal] = useState("");
  const [userName, setUserName] = useState("Arjun");

  /* Step handlers */
  const handlePhoneDone = (p: string) => {
    setPhoneLocal(p);
    setPhone(p);
    setStep("otp");
  };

  const handleOTPDone = (token: string, name: string) => {
    setUserName(name);
    // Store partial auth — pin still needed
    setAuthenticated(token, name);
    setStep("mpin");
  };

  const handleMPINDone = (token: string, name: string) => {
    setAuthenticated(token, name);
    completeOnboarding(); // returning user — skip onboarding
    setStep("loading");
    setTimeout(() => navigate("/dashboard"), 2200);
  };

  /* Forgot PIN → back to OTP step */
  const handleForgotPIN = () => {
    setStep("otp");
  };

  /* Back logic per step */
  const handleBack = () => {
    if (step === "phone") navigate("/");
    else if (step === "otp") setStep("phone");
    else if (step === "mpin") setStep("otp");
  };

  const showBack = step !== "loading";

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        {/* Back button */}
        {showBack && (
          <button
            id="signin-back"
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground mb-6 self-start"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        )}

        {/* Step indicator */}
        {step !== "loading" && <StepStrip step={step} />}

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === "phone" && (
            <PhoneStep key="phone" onDone={handlePhoneDone} />
          )}

          {step === "otp" && (
            <OTPStep key="otp" phone={phone} onDone={handleOTPDone} />
          )}

          {step === "mpin" && (
            <MPINStep
              key="mpin"
              phone={phone}
              onDone={handleMPINDone}
              onForgot={handleForgotPIN}
            />
          )}

          {step === "loading" && (
            <LoadingStep key="loading" name={userName} />
          )}
        </AnimatePresence>

        {/* Sign up nudge */}
        {step === "phone" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-center text-muted-foreground mt-6"
          >
            New to Zyro?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-accent font-semibold"
            >
              Create account
            </button>
          </motion.p>
        )}
      </div>
    </MobileContainer>
  );
}
