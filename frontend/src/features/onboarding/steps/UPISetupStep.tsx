import React, { useState } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { StickyCTA } from "../../../design-system/layouts/StickyCTA";
import { Button } from "../../../design-system/components/Button";
import { apiService } from "../../../services/api";
import { toast } from "sonner";

export function UPISetupStep() {
  const { data, updateData, nextStep, syncWithBackend } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [accountName, setAccountName] = useState("");

  const focusClass = "focus:ring-2 focus:ring-[#62B6CB] focus:ring-offset-2 outline-none transition-all";

  // Basic UPI validation: name@bank
  const isValidUpi = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(data.upiId);

  const handleVerify = async () => {
    if (!isValidUpi) return;
    
    setLoading(true);
    try {
      await apiService.worker.configureUpi(data.upiId);
      await syncWithBackend();
      toast.success("Payout ID linked");
      nextStep();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to link UPI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#1B4965]/60 px-1">
            Unified Payout ID (UPI)
          </label>
          <input
            type="text"
            placeholder="e.g. mobile@ybl"
            value={data.upiId}
            autoFocus
            onChange={(e) => updateData({ upiId: e.target.value.trim() })}
            className={`
              w-full h-16 px-6 bg-[#F4FBFB] rounded-[24px] 
              text-[20px] font-bold text-[#1B4965] placeholder:text-[#1B4965]/20
              shadow-[0_4px_20px_rgba(27,73,101,0.08)]
              ${focusClass}
            `}
          />
          <p className="text-[13px] text-[#1B4965]/50 font-medium px-2">
            Payouts will be sent to this ID automatically when weather disruptions are detected.
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#1B4965]/60 px-1">
            Account Holder Name (Optional)
          </label>
          <input
            type="text"
            placeholder="Name as per bank"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className={`
              w-full h-16 px-6 bg-[#F4FBFB] rounded-[24px] 
              text-[18px] font-bold text-[#1B4965] placeholder:text-[#1B4965]/20
              shadow-[0_4px_20px_rgba(27,73,101,0.08)]
              ${focusClass}
            `}
          />
        </div>
      </div>

      <div className="bg-[#62B6CB]/10 p-5 rounded-[24px] border-2 border-[#62B6CB]/5 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-[#62B6CB] shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <p className="text-[13px] text-[#1B4965]/80 font-medium leading-relaxed">
          Ensure this UPI ID is active and linked to your primary bank account for instant settlements.
        </p>
      </div>

      <StickyCTA>
        <Button onClick={handleVerify} disabled={!isValidUpi || loading}>
          {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : "Link Payout ID"}
        </Button>
      </StickyCTA>
    </div>
  );
}
