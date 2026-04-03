import React from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";

const PLATFORMS = ["Swiggy", "Zomato", "Uber", "Zepto", "Blinkit", "Other"];
const VEHICLES = ["Bike", "Electric Scooter", "Cycle", "Other"];

export function PlatformStep() {
  const { data, updateData, nextStep } = useOnboardingStore();

  const isComplete = !!data.platform;

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1B4965] mb-2">Work Platform</h2>
        <p className="text-[#1B4965]/60">Where do you earn most of your income?</p>
      </div>

      <div className="space-y-6 flex-1">
        <div>
          <label className="block text-sm font-semibold mb-2 text-[#1B4965]/80 uppercase tracking-wider">Primary Platform</label>
          <div className="grid grid-cols-2 gap-3">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => updateData({ platform: p })}
                className={`h-14 rounded-2xl border-2 font-bold text-sm transition-all shadow-sm ${
                  data.platform === p 
                    ? "bg-[#62B6CB] border-[#62B6CB] text-white shadow-lg" 
                    : "bg-white border-[#1B4965]/5 text-[#1B4965]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-[#1B4965]/80 uppercase tracking-wider">Vehicle Type</label>
          <div className="flex flex-wrap gap-2">
            {VEHICLES.map((v) => (
              <button
                key={v}
                onClick={() => updateData({ vehicleType: v })}
                className={`px-4 h-10 rounded-full border-2 font-bold text-xs transition-all ${
                  data.vehicleType === v 
                    ? "bg-[#1B4965] border-[#1B4965] text-white" 
                    : "bg-white border-[#1B4965]/5 text-[#1B4965]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-[#1B4965]/80 uppercase tracking-wider">Partner ID (Optional)</label>
          <Input 
            placeholder="Ex: 552190"
            value={data.workerId || ""}
            onChange={(e) => updateData({ workerId: e.target.value })}
            className="h-14 bg-white border-2 border-[#1B4965]/5 rounded-2xl text-lg font-bold shadow-sm"
          />
        </div>
      </div>

      <Button
        onClick={nextStep}
        disabled={!isComplete}
        className="w-full h-16 rounded-2xl font-bold text-lg bg-[#62B6CB] text-white mt-8"
      >
        Continue
      </Button>
    </div>
  );
}
