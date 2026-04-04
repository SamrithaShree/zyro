import React, { useState, useEffect } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { StickyCTA } from "../../../design-system/layouts/StickyCTA";
import { Button } from "../../../design-system/components/Button";
import { apiService } from "../../../services/api";
import { toast } from "sonner";
import { motion } from "motion/react";

export function ReviewStep() {
  const { data, nextStep, syncWithBackend } = useOnboardingStore();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [workerId, setWorkerId] = useState<string | null>(null);

  useEffect(() => {
    handleRegister();
  }, []);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await apiService.worker.register();
      const resData = response.data.data;
      setWorkerId(resData.worker_id);
      
      // Update auth store with registration status
      setAuth({
        token: useAuthStore.getState().token!,
        is_registered: true,
        has_mpin: useAuthStore.getState().hasMpin,
        worker_id: resData.worker_id
      });
      
      await syncWithBackend();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Profile registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-10">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="w-full space-y-10"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 bg-[#62B6CB] rounded-[32px] flex items-center justify-center text-white shadow-[0_12px_40px_rgba(98,182,203,0.4)]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-[28px] font-bold text-[#1B4965] tracking-tight">You're Verified!</h2>
            <p className="text-[16px] text-[#1B4965]/60 font-medium">Your Zyro Partner profile is active.</p>
          </div>
        </div>

        <div className="bg-[#F4FBFB] p-8 rounded-[32px] shadow-[0_8px_30px_rgba(27,73,101,0.05)] border-2 border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#62B6CB]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <div className="space-y-1 text-center">
              <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1B4965]/40">Partner ID</span>
              <div className="text-[32px] font-black text-[#1B4965] tracking-tighter">
                {workerId || "ZY-882190"}
              </div>
            </div>

            <div className="w-full pt-6 border-t border-[#1B4965]/10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#1B4965]/60">Identity</span>
                <span className="text-[14px] font-bold text-[#1B4965]">{data.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#1B4965]/60">Platform</span>
                <span className="text-[14px] font-bold text-[#1B4965]">{data.platform}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#1B4965]/60">Region</span>
                <span className="text-[14px] font-bold text-[#1B4965]">{data.city}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <StickyCTA>
        <Button onClick={nextStep} disabled={loading}>
          Continue to Policy
        </Button>
      </StickyCTA>
    </div>
  );
}
