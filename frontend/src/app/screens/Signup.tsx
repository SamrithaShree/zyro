import { useState } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, User, Smartphone } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { signup } from "../../services/mock/auth.mock";
import { useAuthStore } from "../../store/useAuthStore";
import { toast } from "sonner";

export function Signup() {
  const navigate = useNavigate();
  const setPhone = useAuthStore((s) => s.setPhone);
  const [name, setName] = useState("");
  const [phone, setPhoneLocal] = useState("");
  const [loading, setLoading] = useState(false);

  const valid = name.trim().length >= 2 && phone.length === 10;

  const handleSignup = async () => {
    if (!valid) return;
    setLoading(true);
    try {
      await signup(name.trim(), phone);
      setPhone(phone);
      useAuthStore.getState().setPhone(phone);
      navigate("/verify-otp");
    } catch {
      toast.error("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-muted-foreground mb-10"
          aria-label="Back to login"
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
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Create your account</h1>
            <p className="text-muted-foreground text-sm">
              Join Zyro in under 2 minutes
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">
                Your Name
              </label>
              <Input
                type="text"
                placeholder="Arjun Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 bg-card border-border text-base"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-muted-foreground">
                Phone Number
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 h-14 bg-card rounded-xl border border-border">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <span>+91</span>
                </div>
                <Input
                  type="tel"
                  placeholder="0000000000"
                  value={phone}
                  onChange={(e) =>
                    setPhoneLocal(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="flex-1 h-14 bg-card border-border text-lg"
                  maxLength={10}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <Button
          onClick={handleSignup}
          disabled={!valid || loading}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Continue"}
        </Button>
      </div>
    </MobileContainer>
  );
}
