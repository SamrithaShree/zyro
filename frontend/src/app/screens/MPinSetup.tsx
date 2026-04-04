import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";
import { apiService } from "../../services/api";
import { StepContainer } from "../../design-system/layouts/StepContainer";
import { StickyCTA } from "../../design-system/layouts/StickyCTA";
import { Button } from "../../design-system/components/Button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

type SetupStep = "create" | "confirm";

export function MPinSetup() {
  const navigate = useNavigate();
  const { phone, isRegistered } = useAuthStore();
  
  const [step, setStep] = useState<SetupStep>("create");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const focusClass = "focus:ring-2 focus:ring-[#62B6CB] focus:ring-offset-2 outline-none transition-all";

  const setHasMpin = useAuthStore((s) => s.setHasMpin);

  const handleNext = () => {
    if (step === "create" && pin.length === 4) {
      setStep("confirm");
    }
  };

  const handleFinish = async () => {
    if (pin !== confirmPin) {
      toast.error("PINs do not match. Please try again.");
      setConfirmPin("");
      setStep("create");
      setPin("");
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.auth.setMpin(pin);
      if (res.data.status === "SUCCESS") {
        toast.success("Security PIN set successfully");
        setHasMpin(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to set mPIN");
    } finally {
      setLoading(false);
    }
  };

  const onBack = () => {
    if (step === "confirm") {
      setStep("create");
      setConfirmPin("");
    } else {
      navigate("/login");
    }
  };

  const currentPin = step === "create" ? pin : confirmPin;
  const setCurrentPin = step === "create" ? setPin : setConfirmPin;

  return (
    <StepContainer
      step={step === "create" ? 1 : 2}
      totalSteps={2}
      title={step === "create" ? "Set Security PIN" : "Confirm Security PIN"}
      subtext={step === "create" 
        ? "Create a 4-digit PIN to secure your account and simplify future logins." 
        : "Re-enter your 4-digit PIN to confirm."
      }
      onBack={onBack}
    >
      <div className="space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex justify-center gap-4"
          >
            {[...Array(4)].map((_, i) => (
              <input
                key={`${step}-${i}`}
                type="password"
                inputMode="numeric"
                maxLength={1}
                aria-label={`${step === 'create' ? 'New' : 'Confirm'} PIN Digit ${i + 1}`}
                value={currentPin[i] || ""}
                autoFocus={i === 0}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val) {
                    const newPinArr = currentPin.split("");
                    newPinArr[i] = val;
                    const finalPin = newPinArr.join("").slice(0, 4);
                    setCurrentPin(finalPin);
                    if (i < 3) {
                      const next = e.target.nextElementSibling as HTMLInputElement;
                      next?.focus();
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !currentPin[i] && i > 0) {
                    const prev = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
                    prev?.focus();
                  } else if (e.key === "Enter" && currentPin.length === 4) {
                    step === "create" ? handleNext() : handleFinish();
                  }
                }}
                className={`
                  w-14 h-16 bg-[#F4FBFB] rounded-[20px] 
                  text-center text-[24px] font-bold text-[#1B4965]
                  shadow-[0_4px_20px_rgba(27,73,101,0.08)]
                  ${focusClass}
                `}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <StickyCTA>
        <Button
          onClick={step === "create" ? handleNext : handleFinish}
          disabled={loading || currentPin.length !== 4}
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            step === "create" ? "Next" : "Confirm & Setup"
          )}
        </Button>
      </StickyCTA>
    </StepContainer>
  );
}
