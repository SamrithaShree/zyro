import React from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { StickyCTA } from "../../../design-system/layouts/StickyCTA";
import { Button } from "../../../design-system/components/Button";

export function IdentityStep() {
  const { data, updateData, nextStep } = useOnboardingStore();

  const focusClass = "focus:ring-2 focus:ring-[#62B6CB] focus:ring-offset-2 outline-none transition-all";

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-6">
        {/* Full Name */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#1B4965]/60 px-1">
            Full Name (as per Aadhaar)
          </label>
          <input
            type="text"
            placeholder="e.g. Rajesh Kumar"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            className={`
              w-full h-16 px-6 bg-[#F4FBFB] rounded-[20px] 
              text-[18px] font-bold text-[#1B4965] placeholder:text-[#1B4965]/20
              shadow-[0_4px_20px_rgba(27,73,101,0.08)]
              ${focusClass}
            `}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* DOB */}
          <div className="space-y-3">
            <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#1B4965]/60 px-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={data.dob || ""}
              onChange={(e) => updateData({ dob: e.target.value })}
              className={`
                w-full h-16 px-4 bg-[#F4FBFB] rounded-[20px] 
                text-[16px] font-bold text-[#1B4965]
                shadow-[0_4px_20px_rgba(27,73,101,0.08)]
                ${focusClass}
              `}
            />
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#1B4965]/60 px-1">
              Gender
            </label>
            <div className="relative">
              <select
                value={data.gender || ""}
                onChange={(e) => updateData({ gender: e.target.value })}
                className={`
                  w-full h-16 px-4 bg-[#F4FBFB] rounded-[20px] 
                  text-[16px] font-bold text-[#1B4965] appearance-none
                  shadow-[0_4px_20px_rgba(27,73,101,0.08)]
                  ${focusClass}
                `}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#1B4965]/40">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#62B6CB]/10 p-5 rounded-[24px] border-2 border-[#62B6CB]/5 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-[#62B6CB] shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <p className="text-[13px] text-[#1B4965]/80 font-medium leading-relaxed">
          We use this data only for insurance eligibility and to ensure your payouts are sent to the correct person.
        </p>
      </div>

      <StickyCTA>
        <Button onClick={async () => {
          // Sync with backend to keep session warm
          await useOnboardingStore.getState().syncWithBackend();
          nextStep();
        }} disabled={!data.name}>
          Continue
        </Button>
      </StickyCTA>
    </div>
  );
}
