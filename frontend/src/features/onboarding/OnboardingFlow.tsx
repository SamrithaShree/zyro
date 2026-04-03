import React from "react";
import { MobileContainer } from "../../app/components/MobileContainer";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Steps
import { ConsentStep } from "./steps/ConsentStep";
import { IdentityStep } from "./steps/IdentityStep";
import { PlatformStep } from "./steps/PlatformStep";
import { AadhaarStep } from "./steps/AadhaarStep";
import { SelfieStep } from "./steps/SelfieStep";
import { LocationStep } from "./steps/LocationStep";
import { WorkDetailsStep } from "./steps/WorkDetailsStep";
import { UPISetupStep } from "./steps/UPISetupStep";
import { ReviewStep } from "./steps/ReviewStep";
import { MPinSetupStep } from "./steps/MPinSetupStep";
import { InsuranceReviewStep } from "./steps/InsuranceReviewStep";

const TOTAL_STEPS = 11;

export function OnboardingFlow() {
  const { currentStep, prevStep } = useOnboardingStore();

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <ConsentStep />;
      case 2: return <IdentityStep />;
      case 3: return <PlatformStep />;
      case 4: return <AadhaarStep />;
      case 5: return <SelfieStep />;
      case 6: return <LocationStep />;
      case 7: return <WorkDetailsStep />;
      case 8: return <UPISetupStep />;
      case 9: return <ReviewStep />;
      case 10: return <MPinSetupStep />;
      case 11: return <InsuranceReviewStep />;
      default: return null;
    }
  };

  return (
    <MobileContainer style={{ backgroundColor: "#BEE9E8" }}>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="px-8 pt-10 pb-6 bg-white/20 backdrop-blur-sm sticky top-0 z-10 border-b border-[#1B4965]/5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 text-[#1B4965] transition-opacity ${
                currentStep === 1 ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-tighter">Progress</span>
              <span className="text-sm font-black text-[#1B4965]">
                {String(currentStep).padStart(2, '0')} / {TOTAL_STEPS}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#62B6CB]"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 py-8 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MobileContainer>
  );
}
