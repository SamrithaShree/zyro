import React, { useState, useEffect } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { StickyCTA } from "../../../design-system/layouts/StickyCTA";
import { Button } from "../../../design-system/components/Button";
import { apiService } from "../../../services/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export function SelfieStep() {
  const { updateData, syncWithBackend } = useOnboardingStore();
  const [status, setStatus] = useState<"idle" | "scanning" | "success">("idle");
  const [loading, setLoading] = useState(false);

  const handleCapture = async () => {
    setStatus("scanning");
    
    // Artificial delay for "Scanning" animation
    setTimeout(async () => {
      setLoading(true);
      try {
        await apiService.auth.verifySelfie("mock_selfie_data");
        await syncWithBackend();
        setStatus("success");
        updateData({ selfieUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=verified" });
        toast.success("Biometric match confirmed");
      } catch (err: any) {
        setStatus("idle");
        toast.error(err.response?.data?.message || "Verification failed. Please retry.");
      } finally {
        setLoading(false);
      }
    }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col items-center py-4">
      <div className="relative w-64 h-64 mb-12">
        {/* Biometric Frame */}
        <div className={`
          absolute inset-0 rounded-full border-4 transition-colors duration-500
          ${status === 'success' ? 'border-[#62B6CB]' : 'border-white/40'}
          flex items-center justify-center overflow-hidden bg-white/5
        `}>
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[#1B4965]/20"
              >
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg>
              </motion.div>
            )}

            {status === "scanning" && (
              <motion.div
                key="scanning-ui"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ 
                    top: ["10%", "90%", "10%"],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-[#62B6CB] shadow-[0_0_15px_#62B6CB] z-10"
                />
                <div className="text-[#62B6CB] opacity-40">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2  12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success-ui"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4 text-[#62B6CB]"
              >
                <div className="w-20 h-20 bg-[#62B6CB]/10 rounded-full flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <span className="text-[14px] font-bold uppercase tracking-widest">Match 98.4%</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Decorative Corner Brackets */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-[#62B6CB] rounded-tl-2xl" />
        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-[#62B6CB] rounded-tr-2xl" />
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-[#62B6CB] rounded-bl-2xl" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-[#62B6CB] rounded-br-2xl" />
      </div>

      <div className="text-center space-y-3 px-6">
        <h3 className="text-[18px] font-bold text-[#1B4965]">
          {status === 'success' ? 'Verification Complete' : 'Position your face'}
        </h3>
        <p className="text-[14px] text-[#1B4965]/60 font-medium leading-relaxed">
          {status === 'success' 
            ? 'Liveness check passed. Your profile is now biometrically secured.' 
            : 'Ensure you are in a well-lit area and not wearing a hat or sunglasses.'}
        </p>
      </div>

      <StickyCTA>
        {status !== "success" ? (
          <Button onClick={handleCapture} disabled={status === "scanning"}>
            {status === "scanning" ? "Scanning..." : "Start Biometric Scan"}
          </Button>
        ) : (
          <Button onClick={syncWithBackend}>
            Continue
          </Button>
        )}
      </StickyCTA>
    </div>
  );
}
