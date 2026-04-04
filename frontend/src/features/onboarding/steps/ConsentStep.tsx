import React, { useState } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { StickyCTA } from "../../../design-system/layouts/StickyCTA";
import { Button } from "../../../design-system/components/Button";
import { SelectionCard } from "../../../design-system/components/SelectionCard";
import { apiService } from "../../../services/api";
import { toast } from "sonner";

export function ConsentStep() {
  const { data, updateData, nextStep, syncWithBackend } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [notificationConsent, setNotificationConsent] = useState(true);

  const canProceed = data.locationConsent && data.cameraConsent && data.termsConsent;

  const handleProceed = async () => {
    if (!canProceed) return;
    
    setLoading(true);
    try {
      await apiService.auth.permissions({
        location_consent: data.locationConsent,
        notification_consent: notificationConsent,
        data_consent: data.termsConsent,
      });
      await syncWithBackend();
      nextStep();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save permissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SelectionCard
          selected={data.locationConsent}
          onClick={() => updateData({ locationConsent: !data.locationConsent })}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          }
        >
          <div className="space-y-1">
            <div className="text-[16px] font-bold">Location Access</div>
            <div className={`text-[12px] ${data.locationConsent ? 'text-white/80' : 'text-[#1B4965]/60'} font-medium`}>Required for parametric triggers</div>
          </div>
        </SelectionCard>

        <SelectionCard
          selected={data.cameraConsent}
          onClick={() => updateData({ cameraConsent: !data.cameraConsent })}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
          }
        >
          <div className="space-y-1">
            <div className="text-[16px] font-bold">Camera Access</div>
            <div className={`text-[12px] ${data.cameraConsent ? 'text-white/80' : 'text-[#1B4965]/60'} font-medium`}>Required for liveness check</div>
          </div>
        </SelectionCard>

        <SelectionCard
          selected={notificationConsent}
          onClick={() => setNotificationConsent(!notificationConsent)}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          }
        >
          <div className="space-y-1">
            <div className="text-[16px] font-bold">Notifications</div>
            <div className={`text-[12px] ${notificationConsent ? 'text-white/80' : 'text-[#1B4965]/60'} font-medium`}>Get payout alerts (optional)</div>
          </div>
        </SelectionCard>
      </div>

      <div className="pt-4 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-1">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={data.termsConsent}
              onChange={(e) => updateData({ termsConsent: e.target.checked })}
            />
            <div className={`
              w-6 h-6 rounded-lg border-2 transition-all
              ${data.termsConsent ? 'bg-[#62B6CB] border-[#62B6CB]' : 'bg-white/20 border-[#1B4965]/20 group-hover:border-[#62B6CB]/40'}
            `} />
            <svg className={`absolute w-4 h-4 text-white transition-opacity ${data.termsConsent ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <span className="text-[14px] text-[#1B4965] font-medium leading-tight">
            I agree to the <span className="text-[#62B6CB] font-bold">Terms of Service</span> and <span className="text-[#62B6CB] font-bold">Privacy Policy</span>.
          </span>
        </label>
      </div>

      <StickyCTA>
        <Button onClick={handleProceed} disabled={!canProceed || loading}>
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Grant Permissions"
          )}
        </Button>
      </StickyCTA>
    </div>
  );
}
