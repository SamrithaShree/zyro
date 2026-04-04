import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { apiService } from "../../services/api";
import { StepContainer } from "../../design-system/layouts/StepContainer";
import { StickyCTA } from "../../design-system/layouts/StickyCTA";
import { Button } from "../../design-system/components/Button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

type LoginStep = "phone" | "otp";

export function PhoneLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const syncOnboarding = useOnboardingStore((s) => s.syncWithBackend);
  
  const [step, setStep] = useState<LoginStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Focus ring class from design system
  const focusClass = "focus:ring-2 focus:ring-[#62B6CB] focus:ring-offset-2 outline-none transition-all";

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit number");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.auth.sendOtp(phone);
      if (res.data.status === "SUCCESS") {
        setStep("otp");
        toast.success("OTP sent successfully");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiService.auth.verifyOtp(phone, otp);
      if (res.data.status === "SUCCESS") {
        const authData = res.data.data;
        // setAuth updates the store
        setAuth({ ...authData, phone });
        await syncOnboarding();
        
        toast.success("Identity verified");

        // Explicit navigation based on registration status (PUSH, NO REPLACE)
        if (authData.is_registered && authData.has_mpin) {
          navigate("/mpin-login");
        } else {
          navigate("/onboarding");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP");
      setOtp(""); // Clear OTP on error
    } finally {
      setLoading(false);
    }
  };

  const onBack = () => {
    if (step === "otp") {
      setStep("phone");
      setOtp("");
    } else {
      navigate("/");
    }
  };

  return (
    <StepContainer
      step={step === "phone" ? 1 : 2}
      totalSteps={2}
      onBack={onBack}
      title={step === "phone" ? "Mobile Number" : "Verify Identity"}
      subtext={
        step === "phone"
          ? "Enter your 10-digit mobile number to receive a secure login code."
          : `We've sent a 6-digit verification code to +91 ${phone}`
      }
    >
      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <motion.div
              key="phone-input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[18px] font-bold text-[#1B4965]/40">
                  +91
                </div>
                <input
                  type="tel"
                  placeholder="00000 00000"
                  value={phone}
                  autoFocus
                  aria-label="Mobile Number"
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className={`
                    w-full h-16 pl-16 pr-6 bg-[#F4FBFB] rounded-[20px] 
                    text-[20px] font-bold text-[#1B4965] placeholder:text-[#1B4965]/20
                    shadow-[0_4px_20px_rgba(27,73,101,0.08)]
                    ${error ? 'ring-2 ring-red-400' : ''}
                    ${focusClass}
                  `}
                />
              </div>
              
              {error && (
                <p className="text-red-500 text-sm font-medium px-2 italic">
                  {error}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="otp-input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between gap-2">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    type="tel"
                    maxLength={1}
                    aria-label={`OTP Digit ${i + 1}`}
                    value={otp[i] || ""}
                    autoFocus={i === 0}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val) {
                        const newOtp = otp.split("");
                        newOtp[i] = val;
                        const finalOtp = newOtp.join("").slice(0, 6);
                        setOtp(finalOtp);
                        // Move to next input
                        if (i < 5) {
                          const next = e.target.nextElementSibling as HTMLInputElement;
                          next?.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) {
                        const prev = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
                        prev?.focus();
                      } else if (e.key === "Enter" && otp.length === 6) {
                        handleVerifyOtp();
                      }
                    }}
                    className={`
                      w-full h-14 bg-[#F4FBFB] rounded-[16px] 
                      text-center text-[20px] font-bold text-[#1B4965]
                      shadow-[0_4px_20px_rgba(27,73,101,0.08)]
                      ${error ? 'ring-2 ring-red-400' : ''}
                      ${focusClass}
                    `}
                  />
                ))}
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-[#62B6CB] font-bold text-sm hover:opacity-80 transition-opacity underline underline-offset-4"
                >
                  Resend Code
                </button>
                
                {error && (
                  <p className="text-red-500 text-sm font-medium italic">
                    {error}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <StickyCTA>
        <Button
          onClick={step === "phone" ? handleSendOtp : handleVerifyOtp}
          disabled={loading || (step === "phone" ? phone.length !== 10 : otp.length !== 6)}
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            step === "phone" ? "Send Code" : "Verify & Continue"
          )}
        </Button>
      </StickyCTA>
    </StepContainer>
  );
}
