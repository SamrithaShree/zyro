import { useState } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, Smartphone } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { sendOTP } from "../../services/mock/auth.mock";
import { useAuthStore } from "../../store/useAuthStore";
import { toast } from "sonner";

export function PhoneLogin() {
  const navigate = useNavigate();
  const setPhone = useAuthStore((s) => s.setPhone);
  const [phone, setPhoneLocal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    try {
      await sendOTP(phone);
      setPhone(phone);
      navigate("/verify-otp");
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground mb-12"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          <div className="mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
              <Smartphone className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Enter your phone number</h1>
            <p className="text-muted-foreground text-sm">
              We'll send a 6-digit code to verify
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">
                Phone Number
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 h-14 bg-card rounded-xl border border-border">
                  <span className="text-foreground">+91</span>
                </div>
                <Input
                  type="tel"
                  placeholder="0000000000"
                  value={phone}
                  onChange={(e) =>
                    setPhoneLocal(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="flex-1 h-14 bg-card border-border text-lg tracking-widest"
                  maxLength={10}
                  autoFocus
                />
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to Zyro's terms and privacy policy.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-3">
          <Button
            onClick={handleContinue}
            disabled={phone.length !== 10 || loading}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Sending OTP…" : "Continue"}
          </Button>
          <button
            onClick={() => navigate("/signup")}
            className="w-full text-sm text-center text-muted-foreground"
          >
            New here?{" "}
            <span className="text-accent font-medium">Create account</span>
          </button>
        </div>
      </div>
    </MobileContainer>
  );
}
