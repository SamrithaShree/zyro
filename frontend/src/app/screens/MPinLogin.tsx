import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";
import { apiService } from "../../services/api";
import { StepContainer } from "../../design-system/layouts/StepContainer";
import { StickyCTA } from "../../design-system/layouts/StickyCTA";
import { Button } from "../../design-system/components/Button";
import { toast } from "sonner";
import { motion } from "motion/react";

export function MPinLogin() {
  const navigate = useNavigate();
  const { phone, setAuth } = useAuthStore();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const focusClass = "focus:ring-2 focus:ring-[#62B6CB] focus:ring-offset-2 outline-none transition-all";

  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    if (loginSuccess) {
      navigate("/dashboard", { replace: true });
    }
  }, [loginSuccess, navigate]);

  const handleLogin = async () => {
    if (pin.length !== 4) return;

    setLoading(true);
    setError(false);
    try {
      const res = await apiService.auth.loginMpin(phone, pin);
      if (res.data.status === "SUCCESS") {
        setAuth({ ...res.data.data, phone });
        toast.success("Welcome back");
        setLoginSuccess(true);
      }
    } catch (err: any) {
      setError(true);
      setPin("");
      toast.error(err.response?.data?.message || "Invalid mPIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StepContainer
      step={1}
      totalSteps={1}
      title="Enter mPIN"
      subtext="Enter your 4-digit security PIN to access your account."
      onBack={() => navigate("/login")}
    >
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-center gap-4">
            {[...Array(4)].map((_, i) => (
              <input
                key={i}
                type="password"
                inputMode="numeric"
                maxLength={1}
                aria-label={`PIN Digit ${i + 1}`}
                value={pin[i] || ""}
                autoFocus={i === 0}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val) {
                    const newPin = pin.split("");
                    newPin[i] = val;
                    const finalPin = newPin.join("").slice(0, 4);
                    setPin(finalPin);
                    if (i < 3) {
                      const next = e.target.nextElementSibling as HTMLInputElement;
                      next?.focus();
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !pin[i] && i > 0) {
                    const prev = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
                    prev?.focus();
                  } else if (e.key === "Enter" && pin.length === 4) {
                    handleLogin();
                  }
                }}
                className={`
                  w-14 h-16 bg-[#F4FBFB] rounded-[20px] 
                  text-center text-[24px] font-bold text-[#1B4965]
                  shadow-[0_4px_20px_rgba(27,73,101,0.08)]
                  ${error ? 'ring-2 ring-red-400' : ''}
                  ${focusClass}
                `}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#62B6CB] font-bold text-sm hover:opacity-80 transition-opacity underline underline-offset-4"
            >
              Forgot mPIN?
            </button>
          </div>
        </motion.div>
      </div>

      <StickyCTA>
        <Button
          onClick={handleLogin}
          disabled={loading || pin.length !== 4}
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Login"
          )}
        </Button>
      </StickyCTA>
    </StepContainer>
  );
}
