import React from "react";
import { useNavigate } from "react-router";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { motion, AnimatePresence } from "motion/react";
import { StepContainer } from "../../design-system/layouts/StepContainer";

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
import { InsuranceReviewStep } from "./steps/InsuranceReviewStep";

// Placeholders for remaining steps
const PlaceholderStep = ({ name }: { name: string }) => (
  <div className="py-10 text-center text-[#1B4965]/40 italic">
    {name} coming soon...
  </div>
);

const TOTAL_STEPS = 10;

export function OnboardingFlow() {
  const navigate = useNavigate();
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
      case 10: return <InsuranceReviewStep />;
      default: return <PlaceholderStep name={`Step ${currentStep}`} />;
    }
  };

  const getStepHeader = () => {
    switch (currentStep) {
      case 1: return { title: "Permissions", subtext: "Zyro needs these to verify your work and detect parametric triggers." };
      case 2: return { title: "Basic Identity", subtext: "Tell us a bit about yourself to secure your profile." };
      case 3: return { title: "Work Platform", subtext: "Select the platform where you earn most of your income." };
      case 4: return { title: "Aadhaar Check", subtext: "Secure verification via UIDAI mock gateway." };
      case 5: return { title: "Liveness Check", subtext: "Biometric selfie to match your Aadhaar records." };
      case 6: return { title: "Operating Zone", subtext: "Detecting your service area for parametric coverage." };
      case 7: return { title: "Work Details", subtext: "We calculate your benefit based on your work patterns." };
      case 8: return { title: "Payout ID", subtext: "Where should we send your money when a trigger hits?" };
      case 9: return { title: "Verification", subtext: "Finalizing your Zyro Partner profile." };
      case 10: return { title: "Policy Review", subtext: "Review your personalized protection plan." };
      default: return { title: `Step ${currentStep}`, subtext: "Continuing your onboarding..." };
    }
  };

  const header = getStepHeader();

  const handleBack = () => {
    if (currentStep === 1) {
      navigate(-1);
    } else {
      prevStep();
    }
  };

  return (
    <StepContainer
      step={currentStep}
      totalSteps={TOTAL_STEPS}
      onBack={handleBack}
      title={header.title}
      subtext={header.subtext}
    >
      {renderStep()}
    </StepContainer>
  );
}
