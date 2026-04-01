import { useState, useRef, useEffect } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, ShieldCheck, Info } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { verifyAadhaar, verifyAadhaarOTP } from "../../services/mock/aadhaar.mock";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useOTPTimer } from "../../hooks/useOTPTimer";
import { haptics } from "../../services/haptics";
import { StepProgress } from "../../components/common/StepProgress";
import { toast } from "sonner";

const ONBOARDING_STEPS = [
  { id: 1, label: "Consent" },
  { id: 2, label: "Platform" },
  { id: 3, label: "Identity" },
  { id: 4, label: "Work" },
  { id: 5, label: "UPI" },
];

type AadhaarView = "INPUT" | "OTP" | "SUCCESS";

export function AadhaarVerification() {
  const navigate = useNavigate();
  const setAadhaar = useOnboardingStore((s) => s.setAadhaar);
  const setTrustScore = useAuthStore((s) => s.setTrustScore);
  const trustScore = useAuthStore((s) => s.trustScore);

  const [view, setView] = useState<AadhaarView>("INPUT");
  const [aadhaar, setAadhaarInput] = useState("");
  const [otp, setOtpArr] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [maskedNum, setMaskedNum] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { seconds, canResend, restart } = useOTPTimer(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (view === "OTP") inputRefs.current[0]?.focus();
  }, [view]);

  const formatAadhaar = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(" ")
    );
  };

  const handleSendOTP = async () => {
    const digits = aadhaar.replace(/\s/g, "");
    if (digits.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await verifyAadhaar(digits);
      setMaskedNum(res.maskedNumber);
      setView("OTP");
      toast.success("OTP sent to Aadhaar-linked mobile");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
      haptics.error();
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtpArr(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every(Boolean) && i === 5) handleVerifyOTP(next.join(""));
  };

  const handleOTPKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      inputRefs.current[i - 1]?.focus();
  };

  const handleVerifyOTP = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyAadhaarOTP(code);
      setAadhaar(aadhaar.replace(/\s/g, "").slice(-4), "VERIFIED");
      setTrustScore(Math.min(100, trustScore + res.trustBoost));
      haptics.success();
      setView("SUCCESS");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid OTP");
      setOtpArr(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      haptics.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        <div className="mb-6">
          <StepProgress steps={ONBOARDING_STEPS} currentStep={3} variant="dots" />
        </div>

        <button
          onClick={() => navigate("/platform-selection")}
          className="flex items-center gap-2 text-muted-foreground mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <AnimatePresence mode="wait">
          {view === "SUCCESS" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-24 h-24 bg-success/10 rounded-3xl flex items-center justify-center mb-6"
              >
                <ShieldCheck className="w-12 h-12 text-success" />
              </motion.div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/30 rounded-full mb-4">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span className="text-sm font-semibold text-success">
                  Verified Badge
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-2">Identity Verified!</h1>
              <p className="text-muted-foreground text-sm mb-2">{maskedNum}</p>
              <p className="text-xs text-success">
                Higher trust → faster payouts (+15 Trust Score)
              </p>
              <Button
                onClick={() => navigate("/platform-id-verify")}
                className="mt-10 w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Continue
              </Button>
            </motion.div>
          ) : view === "OTP" ? (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="flex-1"
            >
              <h1 className="text-2xl font-bold mb-1">Enter OTP</h1>
              <p className="text-muted-foreground text-sm mb-1">
                Sent to Aadhaar-linked mobile for <strong>{maskedNum}</strong>
              </p>
              <div className="flex gap-2 justify-center my-8">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
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
              {error && (
                <p className="text-sm text-destructive text-center mb-4">
                  {error}
                </p>
              )}
              <div className="text-center">
                {canResend ? (
                  <button
                    onClick={() => { restart(); toast.success("OTP resent!"); }}
                    className="text-sm text-accent"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Resend in {seconds}s
                  </p>
                )}
              </div>
              <Button
                onClick={() => handleVerifyOTP(otp.join(""))}
                disabled={!otp.every(Boolean) || loading}
                className="mt-8 w-full h-14 bg-primary text-primary-foreground disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify"}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1"
            >
              {/* Optional badge */}
              <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border border-accent/20 rounded-xl mb-6">
                <Info className="w-4 h-4 text-accent flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Optional</strong> —
                  improves trust score &amp; enables faster payouts
                </p>
              </div>

              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-accent" />
              </div>
              <h1 className="text-2xl font-bold mb-1">Verify with Aadhaar</h1>
              <p className="text-muted-foreground text-sm mb-8">
                Masked securely. Never stored raw.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">
                    Aadhaar Number
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="0000 0000 0000"
                    value={aadhaar}
                    onChange={(e) =>
                      setAadhaarInput(formatAadhaar(e.target.value))
                    }
                    className="w-full h-14 px-4 bg-card border border-border rounded-xl text-lg font-mono focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all tracking-widest"
                    aria-label="Aadhaar number"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>

              <div className="mt-auto space-y-3 pt-10">
                <Button
                  onClick={handleSendOTP}
                  disabled={
                    aadhaar.replace(/\s/g, "").length !== 12 || loading
                  }
                  className="w-full h-14 bg-primary text-primary-foreground disabled:opacity-50"
                >
                  {loading ? "Sending OTP…" : "Send OTP"}
                </Button>
                <button
                  onClick={() => {
                    useOnboardingStore.getState().setAadhaar("", "SKIPPED");
                    navigate("/platform-id-verify");
                  }}
                  className="w-full text-sm text-muted-foreground"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileContainer>
  );
}
