import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makePersistConfig } from "./middleware/persist";
import { apiService } from "../services/api";
import { useAuthStore } from "./useAuthStore";

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
  syncWithBackend: () => Promise<void>;
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
  incomeBand: "5,000 - 7,000",
  upiId: "",
};

const BACKEND_STATE_TO_STEP: Record<string, number> = {
  "INIT": 1,
  "PHONE_VERIFIED": 1,
  "PERMISSIONS_COMPLETED": 2,
  "AADHAAR_OTP_SENT": 4,
  "AADHAAR_LINKED": 5,
  "SELFIE_VERIFIED": 6,
  "LOCATION_CAPTURED": 7,
  "WORK_PROFILE_COMPLETED": 8,
  "UPI_CONFIGURED": 9,
  "WORKER_REGISTERED": 10,
  "MPIN_SET": 11,
  "INSURANCE_ACKNOWLEDGED": 12,
  "READY": 12
};


export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
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

      complete: () => {
        set({ isComplete: true });
        useAuthStore.getState().setOnboardingComplete(true);
      },

      reset: () => {
        set({ currentStep: 1, data: initialData, isComplete: false });
        useAuthStore.getState().setOnboardingComplete(false);
      },

      syncWithBackend: async () => {
        try {
          const res = await apiService.auth.getOnboardingStatus();
          if (res.data.status === "SUCCESS") {
            const { onboarding_state, can_activate_policy } = res.data.data;
            const step = BACKEND_STATE_TO_STEP[onboarding_state] || 1;
            
            if (step === 2 && get().currentStep === 3) {
              return;
            }

            if (step > 11 || can_activate_policy) {
              set({ isComplete: true, currentStep: 11 });
              useAuthStore.getState().setOnboardingComplete(true);
            } else {
              set({ currentStep: step });
              useAuthStore.getState().setOnboardingComplete(false);
            }
          }
        } catch (error) {
          console.error("Onboarding sync failed", error);
        }
      }
    }),
    makePersistConfig<OnboardingState>("onboarding", 6, (state) => ({
      currentStep: state.currentStep,
      data: state.data,
      isComplete: state.isComplete,
    }))
  )
);
