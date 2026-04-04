import React, { useState, useEffect } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { StickyCTA } from "../../../design-system/layouts/StickyCTA";
import { Button } from "../../../design-system/components/Button";
import { SliderInput } from "../../../design-system/components/SliderInput";
import { SelectionCard } from "../../../design-system/components/SelectionCard";
import { apiService } from "../../../services/api";
import { toast } from "sonner";
import { motion } from "motion/react";

const INCOME_BANDS = [
  { label: "Low", range: "< ₹3,000", value: "3000" },
  { label: "Medium", range: "₹3,000 - ₹7,000", value: "5000" },
  { label: "High", range: "₹7,000 - ₹12,000", value: "9000" },
  { label: "Pro", range: "> ₹12,000", value: "12000" }
];

export function WorkDetailsStep() {
  const { data, updateData, nextStep, syncWithBackend } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  // Auto-calculate weekly income when daily or days change
  useEffect(() => {
    const daily = parseInt(data.dailyIncome) || 0;
    const days = parseInt(data.daysPerWeek) || 0;
    const weekly = daily * days;
    updateData({ weeklyIncome: weekly.toString() });
  }, [data.dailyIncome, data.daysPerWeek]);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await apiService.worker.saveWorkProfile({
        platform: data.platform,
        working_hours_per_day: parseInt(data.workingHoursPerDay),
        days_worked_per_week: parseInt(data.daysPerWeek),
        income_band: data.incomeBand
      });
      await syncWithBackend();
      nextStep();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save work profile");
    } finally {
      setLoading(false);
    }
  };

  const isComplete = data.workingHoursPerDay && data.daysPerWeek && data.incomeBand;

  return (
    <div className="space-y-10 pb-10">
      <div className="space-y-8">
        {/* Working Hours */}
        <SliderInput
          label="Working Hours / Day"
          unit=" hrs"
          min={1}
          max={16}
          step={1}
          value={parseInt(data.workingHoursPerDay)}
          onChange={(val) => updateData({ workingHoursPerDay: val.toString() })}
        />

        {/* Days Per Week */}
        <SliderInput
          label="Days / Week"
          unit=" days"
          min={1}
          max={7}
          step={1}
          value={parseInt(data.daysPerWeek)}
          onChange={(val) => updateData({ daysPerWeek: val.toString() })}
        />

        {/* Daily Income */}
        <SliderInput
          label="Avg. Daily Income"
          unit=""
          min={200}
          max={3000}
          step={50}
          value={parseInt(data.dailyIncome)}
          onChange={(val) => updateData({ dailyIncome: val.toString() })}
        />

        {/* Weekly Summary Display */}
        <div className="bg-[#62B6CB]/10 p-6 rounded-[28px] border-2 border-[#62B6CB]/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[12px] font-bold text-[#1B4965]/40 uppercase tracking-widest">Est. Weekly Income</span>
            <div className="text-[24px] font-extrabold text-[#1B4965]">₹{data.weeklyIncome}</div>
          </div>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#62B6CB] shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>

        {/* Income Band Selection */}
        <div className="space-y-4">
          <label className="text-[12px] font-bold uppercase tracking-widest text-[#1B4965]/40 px-1">Select Income Band</label>
          <div className="grid grid-cols-2 gap-3">
            {INCOME_BANDS.map((band) => (
              <SelectionCard
                key={band.label}
                selected={data.incomeBand === band.value}
                onClick={() => updateData({ incomeBand: band.value })}
                className="py-4 px-4"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-bold">{band.label}</span>
                  <span className={`text-[10px] font-medium ${data.incomeBand === band.value ? 'text-white/70' : 'text-[#1B4965]/50'}`}>{band.range}</span>
                </div>
              </SelectionCard>
            ))}
          </div>
        </div>
      </div>

      <StickyCTA>
        <Button onClick={handleContinue} disabled={!isComplete || loading}>
          {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : "Save Work Profile"}
        </Button>
      </StickyCTA>
    </div>
  );
}
