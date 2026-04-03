import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makePersistConfig } from "./middleware/persist";

export interface OnboardingData {
  // Step 1: Consent
  locationConsent: boolean;
  cameraConsent: boolean;
  termsConsent: boolean;
  // Step 2: Basic Identity
  name: string;
  dob?: string;
  gender?: string;
  // Step 3: Platform
  platform: string;
  workerId?: string;
  vehicleType?: string;
  // Step 4: Aadhaar
  aadhaarNumber: string;
  // Step 5: Selfie
  selfieUrl?: string;
  // Step 6: Location
  lat?: number;
  lng?: number;
  city?: string;
  zone?: string;
  // Step 7: Work Details
  workingHoursPerDay: string;
  peakHours: string;
  daysPerWeek: string;
  dailyIncome: string;
  weeklyIncome: string;
  incomeBand: string;
  // Step 8: UPI
  upiId: string;
  // Step 10: mPIN
  mpin?: string;
}

interface OnboardingState {
  currentStep: number;
  data: OnboardingData;
  isComplete: boolean;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (partialData: Partial<OnboardingData>) => void;
  complete: () => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  locationConsent: false,
  cameraConsent: false,
  termsConsent: false,
  name: "",
  platform: "",
  aadhaarNumber: "",
  workingHoursPerDay: "8",
  peakHours: "Evening",
  daysPerWeek: "6",
  dailyIncome: "800",
  weeklyIncome: "5000",
  incomeBand: "5000-7000",
  upiId: "",
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 1,
      data: initialData,
      isComplete: false,

      setStep: (step) => set({ currentStep: step }),
      
      nextStep: () => set((state) => ({ 
        currentStep: Math.min(state.currentStep + 1, 11) 
      })),
      
      prevStep: () => set((state) => ({ 
        currentStep: Math.max(state.currentStep - 1, 1) 
      })),

      updateData: (partialData) =>
        set((state) => ({
          data: { ...state.data, ...partialData },
        })),

      complete: () => set({ isComplete: true }),

      reset: () => set({ currentStep: 1, data: initialData, isComplete: false }),
    }),
    makePersistConfig<OnboardingState>("onboarding", 2, (state) => ({
      currentStep: state.currentStep,
      data: state.data,
      isComplete: state.isComplete,
    }))
  )
);
