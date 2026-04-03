import React from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { Button } from "../../../app/components/ui/button";
import { Checkbox } from "../../../app/components/ui/checkbox";
import { ShieldCheck, MapPin, Camera, Bell } from "lucide-react";

export function ConsentStep() {
  const { data, updateData, nextStep } = useOnboardingStore();

  const isComplete = data.locationConsent && data.cameraConsent && data.termsConsent;

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1B4965] mb-2">Permissions</h2>
        <p className="text-[#1B4965]/60">We need these to verify your work and pay you.</p>
      </div>

      <div className="space-y-4 flex-1">
        <div className="p-4 bg-white rounded-2xl border-2 border-[#1B4965]/5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#62B6CB]/10 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-[#62B6CB]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[#1B4965]">Location</span>
              <Checkbox 
                checked={data.locationConsent} 
                onCheckedChange={(val) => updateData({ locationConsent: !!val })}
              />
            </div>
            <p className="text-xs text-[#1B4965]/60">Used to detect disruptions in your delivery zone.</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border-2 border-[#1B4965]/5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#62B6CB]/10 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5 text-[#62B6CB]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[#1B4965]">Camera</span>
              <Checkbox 
                checked={data.cameraConsent} 
                onCheckedChange={(val) => updateData({ cameraConsent: !!val })}
              />
            </div>
            <p className="text-xs text-[#1B4965]/60">Required for selfie and Aadhaar verification.</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border-2 border-[#1B4965]/5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#62B6CB]/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#62B6CB]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[#1B4965]">Agreement</span>
              <Checkbox 
                checked={data.termsConsent} 
                onCheckedChange={(val) => updateData({ termsConsent: !!val })}
              />
            </div>
            <p className="text-xs text-[#1B4965]/60">I agree to Terms, Privacy Policy and Payout Consent.</p>
          </div>
        </div>
      </div>

      <Button
        onClick={nextStep}
        disabled={!isComplete}
        className="w-full h-16 rounded-2xl font-bold text-lg bg-[#62B6CB] text-white mt-8"
      >
        I Agree
      </Button>
    </div>
  );
}
