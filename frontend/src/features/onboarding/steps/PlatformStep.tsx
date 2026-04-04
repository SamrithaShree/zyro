import React, { useState } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { StickyCTA } from "../../../design-system/layouts/StickyCTA";
import { Button } from "../../../design-system/components/Button";
import { SelectionCard } from "../../../design-system/components/SelectionCard";
import { motion, AnimatePresence } from "motion/react";

const PLATFORMS = ["Swiggy", "Zomato", "UberEats"];

export function PlatformStep() {
  const { data, updateData, nextStep } = useOnboardingStore();
  const [showOther, setShowOther] = useState(data.platform !== "" && !PLATFORMS.includes(data.platform));
  const [otherValue, setOtherValue] = useState(showOther ? data.platform : "");

  const handleSelect = (p: string) => {
    setShowOther(false);
    updateData({ platform: p });
  };

  const handleOtherClick = () => {
    setShowOther(true);
    updateData({ platform: otherValue });
  };

  const handleOtherChange = (val: string) => {
    setOtherValue(val);
    updateData({ platform: val });
  };

  const isComplete = data.platform.trim().length > 0;

  return (
    <div className="space-y-4">
      {PLATFORMS.map((p) => (
        <SelectionCard
          key={p}
          selected={data.platform === p && !showOther}
          onClick={() => handleSelect(p)}
        >
          {p}
        </SelectionCard>
      ))}

      <SelectionCard
        selected={showOther}
        onClick={handleOtherClick}
      >
        Other
      </SelectionCard>

      <AnimatePresence>
        {showOther && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-4">
              <input
                type="text"
                placeholder="Enter platform name"
                value={otherValue}
                autoFocus
                onChange={(e) => handleOtherChange(e.target.value)}
                className="w-full h-16 px-6 bg-[#F4FBFB] rounded-[20px] text-[18px] font-bold text-[#1B4965] placeholder:text-[#1B4965]/20 shadow-[0_4px_20px_rgba(27,73,101,0.08)] focus:ring-2 focus:ring-[#62B6CB] focus:ring-offset-2 outline-none transition-all"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StickyCTA>
        <Button onClick={nextStep} disabled={!isComplete}>
          Continue
        </Button>
      </StickyCTA>
    </div>
  );
}
