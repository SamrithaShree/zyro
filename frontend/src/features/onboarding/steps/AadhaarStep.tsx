import React, { useState } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { StickyCTA } from "../../../design-system/layouts/StickyCTA";
import { Button } from "../../../design-system/components/Button";
import { apiService } from "../../../services/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

type AadhaarSubStep = "input" | "otp" | "success";

export function AadhaarStep() {
  const { data, updateData, nextStep } = useOnboardingStore();
  const [subStep, setSubStep] = useState<AadhaarSubStep>("input");
  const [aadhaar, setAadhaar] = useState(data.aadhaarNumber);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const focusClass = "focus:ring-2 focus:ring-[#62B6CB] focus:ring-offset-2 outline-none transition-all";

  const handleSendOtp = async () => {
    if (aadhaar.length !== 12) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }
    setLoading(true);
    try {
      await apiService.auth.sendAadhaarOtp(aadhaar);
      setSubStep("otp");
      toast.success("Verification code sent to linked mobile");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      await apiService.auth.verifyAadhaarOtp(otp);
      updateData({ aadhaarNumber: aadhaar });
      setSubStep("success");
      toast.success("Aadhaar verified successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const maskedAadhaar = aadhaar.replace(/\d(?=\d{4})/g, "X");

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {subStep === "input" && (
          <motion.div
            key="aadhaar-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#1B4965]/60 px-1">
                Aadhaar Number
              </label>
              <input
                type="tel"
                placeholder="0000 0000 0000"
                value={aadhaar}
                autoFocus
                maxLength={12}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                className={`
                  w-full h-16 px-6 bg-[#F4FBFB] rounded-[20px] 
                  text-[20px] font-bold text-[#1B4965] tracking-[0.2em]
                  placeholder:text-[#1B4965]/20 placeholder:tracking-normal
                  shadow-[0_4px_20px_rgba(27,73,101,0.08)]
                  ${focusClass}
                `}
              />
            </div>
            
            <div className="bg-[#1B4965]/5 p-5 rounded-[24px] flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-[#62B6CB]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <p className="text-[13px] text-[#1B4965]/70 font-medium leading-relaxed">
                Zyro uses a secure UIDAI gateway. We do not store your full Aadhaar number on our servers.
              </p>
            </div>
          </motion.div>
        )}

        {subStep === "otp" && (
          <motion.div
            key="aadhaar-otp"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#1B4965]/60 px-1">
                Verification Code
              </label>
              <div className="flex justify-between gap-2">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    type="tel"
                    maxLength={1}
                    value={otp[i] || ""}
                    autoFocus={i === 0}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val) {
                        const newOtp = otp.split("");
                        newOtp[i] = val;
                        setOtp(newOtp.join("").slice(0, 6));
                        if (i < 5) (e.target.nextElementSibling as HTMLInputElement)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) {
                        (e.target.previousElementSibling as HTMLInputElement)?.focus();
                      }
                    }}
                    className={`
                      w-full h-14 bg-[#F4FBFB] rounded-[16px] 
                      text-center text-[20px] font-bold text-[#1B4965]
                      shadow-[0_4px_20px_rgba(27,73,101,0.08)]
                      ${focusClass}
                    `}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleSendOtp}
              className="w-full text-center text-[#62B6CB] font-bold text-sm underline underline-offset-4"
            >
              Resend Code
            </button>
          </motion.div>
        )}

        {subStep === "success" && (
          <motion.div
            key="aadhaar-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 pt-4"
          >
            <div className="bg-[#62B6CB] p-8 rounded-[32px] text-white shadow-[0_12px_30px_rgba(98,182,203,0.3)] flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <div>
                <h3 className="text-[20px] font-bold mb-1">Identity Linked</h3>
                <p className="text-white/80 font-medium">{maskedAadhaar}</p>
              </div>
            </div>
            
            <div className="bg-white/40 p-6 rounded-[24px] border-2 border-white/20">
              <div className="flex items-center gap-3 text-[#1B4965] font-bold mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <span>What's next?</span>
              </div>
              <p className="text-[14px] text-[#1B4965]/70 font-medium leading-relaxed">
                Your Aadhaar is successfully linked. We'll now perform a quick liveness check to complete your biometric verification.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StickyCTA>
        {subStep === "input" && (
          <Button onClick={handleSendOtp} disabled={aadhaar.length !== 12 || loading}>
            {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : "Verify Aadhaar"}
          </Button>
        )}
        {subStep === "otp" && (
          <Button onClick={handleVerifyOtp} disabled={otp.length !== 6 || loading}>
            {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirm Code"}
          </Button>
        )}
        {subStep === "success" && (
          <Button onClick={nextStep}>
            Proceed to Liveness Check
          </Button>
        )}
      </StickyCTA>
    </div>
  );
}
