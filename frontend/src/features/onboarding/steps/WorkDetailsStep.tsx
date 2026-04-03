import React from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { Button } from "../../../app/components/ui/button";

const INCOME_BANDS = [
  "Less than ₹3,000",
  "₹3,000 - ₹5,000",
  "₹5,000 - ₹7,000",
  "₹7,000 - ₹9,000",
  "₹9,000 - ₹12,000",
  "More than ₹12,000"
];

const PEAK_HOURS = ["Morning", "Afternoon", "Evening", "Late Night"];

export function WorkDetailsStep() {
  const { data, updateData, nextStep } = useOnboardingStore();

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1B4965] mb-2">Work Details</h2>
        <p className="text-[#1B4965]/60">We calculate your benefit based on these inputs.</p>
      </div>

      <div className="space-y-8 flex-1">
        <div>
          <div className="flex items-center justify-between mb-4">
             <label className="block text-sm font-semibold text-[#1B4965]/80 uppercase tracking-wider">Working Hours / Day</label>
             <span className="text-xl font-black text-[#62B6CB]">{data.workingHoursPerDay} hrs</span>
          </div>
          <input 
            type="range"
            min="1"
            max="16"
            step="1"
            value={data.workingHoursPerDay}
            onChange={(e) => updateData({ workingHoursPerDay: e.target.value })}
            className="w-full h-2 bg-[#1B4965]/10 rounded-full appearance-none accent-[#62B6CB]"
          />
        </div>

        <div>
           <label className="block text-sm font-semibold mb-4 text-[#1B4965]/80 uppercase tracking-wider">Peak Working Hours</label>
           <div className="grid grid-cols-2 gap-3">
             {PEAK_HOURS.map((h) => (
               <button
                 key={h}
                 onClick={() => updateData({ peakHours: h })}
                 className={`h-12 rounded-xl border-2 font-bold text-xs transition-all ${
                   data.peakHours === h 
                    ? "bg-[#1B4965] border-[#1B4965] text-white" 
                    : "bg-white border-[#1B4965]/5 text-[#1B4965]"
                 }`}
               >
                 {h}
               </button>
             ))}
           </div>
        </div>

        <div>
           <label className="block text-sm font-semibold mb-4 text-[#1B4965]/80 uppercase tracking-wider">Estimated Weekly Income</label>
           <div className="space-y-2">
             {INCOME_BANDS.map((b) => (
               <button
                 key={b}
                 onClick={() => updateData({ incomeBand: b })}
                 className={`w-full h-14 px-4 rounded-2xl border-2 font-bold text-left transition-all flex items-center justify-between ${
                   data.incomeBand === b 
                    ? "bg-[#62B6CB] border-[#62B6CB] text-white shadow-lg" 
                    : "bg-white border-[#1B4965]/5 text-[#1B4965]"
                 }`}
               >
                 <span>{b}</span>
                 {data.incomeBand === b && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
               </button>
             ))}
           </div>
        </div>
      </div>

      <Button
        onClick={nextStep}
        className="w-full h-16 rounded-2xl font-bold text-lg bg-[#62B6CB] text-white mt-8"
      >
        Continue
      </Button>
    </div>
  );
}
