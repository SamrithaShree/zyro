import React, { useState } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { Button } from "../../../app/components/ui/button";
import { Checkbox } from "../../../app/components/ui/checkbox";
import { ShieldCheck, MapPin, Camera, Loader2 } from "lucide-react";
import { apiService } from "../../../services/api";

export function ConsentStep() {
  const { data, updateData, syncWithBackend } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  const isComplete = data.locationConsent && data.cameraConsent && data.termsConsent;

  const handleAgree = async () => {
    setLoading(true);
    try {
      await apiService.auth.permissions({
        location_consent: data.locationConsent,
        notification_consent: true,
        data_consent: data.termsConsent
      });
      await syncWithBackend();
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1B4965] mb-2">Permissions</h2>
        <p className="text-[#1B4965]/60">We need these to verify your work and pay you.</p>
      </div>

      <div className="space-y-4 flex-1">
        <div 
          onClick={() => updateData({ locationConsent: !data.locationConsent })}
          className={`p-5 rounded-3xl border-2 transition-all flex items-start gap-4 cursor-pointer shadow-sm ${
            data.locationConsent 
              ? "bg-[#62B6CB]/5 border-[#62B6CB] shadow-md" 
              : "bg-white border-[#1B4965]/5 hover:border-[#62B6CB]/30"
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
            data.locationConsent ? "bg-[#62B6CB] text-white" : "bg-[#62B6CB]/10 text-[#62B6CB]"
          }`}>
            <MapPin className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-[#1B4965] tracking-tight">Location Access</span>
              <Checkbox 
                checked={data.locationConsent} 
                onCheckedChange={() => {}} // Controlled by div click
                className="pointer-events-none"
              />
            </div>
            <p className="text-xs font-medium text-[#1B4965]/50 leading-relaxed">Required to detect localized parametric triggers in your area.</p>
          </div>
        </div>

        <div 
          onClick={() => updateData({ cameraConsent: !data.cameraConsent })}
          className={`p-5 rounded-3xl border-2 transition-all flex items-start gap-4 cursor-pointer shadow-sm ${
            data.cameraConsent 
              ? "bg-[#62B6CB]/5 border-[#62B6CB] shadow-md" 
              : "bg-white border-[#1B4965]/5 hover:border-[#62B6CB]/30"
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
            data.cameraConsent ? "bg-[#62B6CB] text-white" : "bg-[#62B6CB]/10 text-[#62B6CB]"
          }`}>
            <Camera className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-[#1B4965] tracking-tight">Camera & Face ID</span>
              <Checkbox 
                checked={data.cameraConsent} 
                onCheckedChange={() => {}} // Controlled by div click
                className="pointer-events-none"
              />
            </div>
            <p className="text-xs font-medium text-[#1B4965]/50 leading-relaxed">Used for selfie matching and secure Aadhaar verification.</p>
          </div>
        </div>

        <div 
          onClick={() => updateData({ termsConsent: !data.termsConsent })}
          className={`p-5 rounded-3xl border-2 transition-all flex items-start gap-4 cursor-pointer shadow-sm ${
            data.termsConsent 
              ? "bg-[#62B6CB]/5 border-[#62B6CB] shadow-md" 
              : "bg-white border-[#1B4965]/5 hover:border-[#62B6CB]/30"
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
            data.termsConsent ? "bg-[#62B6CB] text-white" : "bg-[#62B6CB]/10 text-[#62B6CB]"
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-[#1B4965] tracking-tight">User Agreement</span>
              <Checkbox 
                checked={data.termsConsent} 
                onCheckedChange={() => {}} // Controlled by div click
                className="pointer-events-none"
              />
            </div>
            <p className="text-xs font-medium text-[#1B4965]/50 leading-relaxed">I accept the Terms, Privacy Policy and IRDAI Sandbox terms.</p>
          </div>
        </div>
      </div>

      <Button
        onClick={handleAgree}
        disabled={!isComplete || loading}
        className="w-full h-16 rounded-2xl font-bold text-lg bg-[#62B6CB] text-white mt-8"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "I Agree"}
      </Button>
    </div>
  );
}
