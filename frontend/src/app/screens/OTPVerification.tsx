import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { verifyOTP } from "../../services/mock/auth.mock";
import { useAuthStore } from "../../store/useAuthStore";
import { useOTPTimer } from "../../hooks/useOTPTimer";
import { sendOTP } from "../../services/mock/auth.mock";
import { toast } from "sonner";

export function OTPVerification() {
  const navigate = useNavigate();
  const phone = useAuthStore((s) => s.phone);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { seconds, canResend, restart } = useOTPTimer(60);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError(null);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (next.every(Boolean) && index === 5) handleVerify(next.join(""));
  };

  const handleKey = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyOTP(phone, code);
      setAuthenticated(res.token, res.name);
      navigate("/activity-consent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await sendOTP(phone);
    restart();
    toast.success("New OTP sent!");
  };

  const isComplete = otp.every(Boolean);

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        <button onClick={() => navigate("/login")} className="flex items-center gap-2 text-muted-foreground mb-12">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
          <div className="mb-8">
            <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verify your number</h1>
            <p className="text-muted-foreground text-sm">
              6-digit code sent to{" "}
              <span className="text-foreground font-medium">+91 {phone}</span>
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-3 justify-center">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKey(i, e)}
                  className={`w-12 h-14 bg-card border rounded-xl text-center text-xl font-semibold focus:outline-none transition-all ${
                    error
                      ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                      : "border-border focus:border-accent focus:ring-2 focus:ring-accent/20"
                  }`}
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-destructive text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="text-center">
              {canResend ? (
                <button onClick={handleResend} className="text-sm text-accent font-medium">
                  Resend OTP
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Resend in <span className="text-foreground">{seconds}s</span>
                </p>
              )}
            </div>

            {isComplete && !error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="text-sm text-success">Verifying…</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        <Button
          onClick={() => handleVerify(otp.join(""))}
          disabled={!isComplete || loading}
          className="w-full h-14 bg-primary text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Verify"}
        </Button>
      </div>
    </MobileContainer>
  );
}
