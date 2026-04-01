import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makePersistConfig } from "./middleware/persist";

export type OnboardingStep =
  | "CONSENT"
  | "PLATFORM"
  | "AADHAAR"
  | "PLATFORM_ID"
  | "SELFIE"
  | "LOCATION"
  | "WORK"
  | "INCOME"
  | "UPI"
  | "DONE";

export type Platform = "SWIGGY" | "ZOMATO" | "OTHER" | null;
export type IncomeRange = "300-500" | "500-800" | "800-1200" | "1200+" | null;
export type PeakHour = "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT" | null;
export type WorkHours = "4-6" | "6-8" | "8-10" | "10+" | null;

interface Location {
  zone: string;
  city: string;
  lat: number;
  lng: number;
}

interface OnboardingState {
  step: OnboardingStep;
  consentGiven: boolean;
  activityDetectionEnabled: boolean;
  platform: Platform;
  platformId: string;
  platformVerified: boolean;
  aadhaarLast4: string;
  aadhaarStatus: "NONE" | "VERIFIED" | "SKIPPED";
  selfieVerified: boolean;
  location: Location | null;
  workHours: WorkHours;
  peakHour: PeakHour;
  incomeRange: IncomeRange;
  upiId: string;
  upiAutopay: boolean;

  // Actions
  setStep: (step: OnboardingStep) => void;
  setConsent: (given: boolean, activityDetection: boolean) => void;
  setPlatform: (platform: Platform) => void;
  setPlatformId: (id: string, verified: boolean) => void;
  setAadhaar: (last4: string, status: "VERIFIED" | "SKIPPED") => void;
  setSelfie: (verified: boolean) => void;
  setLocation: (location: Location) => void;
  setWorkProfile: (hours: WorkHours, peak: PeakHour) => void;
  setIncome: (range: IncomeRange) => void;
  setUPI: (upiId: string, autopay: boolean) => void;
  complete: () => void;
  reset: () => void;
}

const initialState = {
  step: "CONSENT" as OnboardingStep,
  consentGiven: false,
  activityDetectionEnabled: false,
  platform: null as Platform,
  platformId: "",
  platformVerified: false,
  aadhaarLast4: "",
  aadhaarStatus: "NONE" as const,
  selfieVerified: false,
  location: null as Location | null,
  workHours: null as WorkHours,
  peakHour: null as PeakHour,
  incomeRange: null as IncomeRange,
  upiId: "",
  upiAutopay: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      setConsent: (consentGiven, activityDetectionEnabled) =>
        set({ consentGiven, activityDetectionEnabled, step: "PLATFORM" }),

      setPlatform: (platform) =>
        set({ platform, step: "AADHAAR" }),

      setAadhaar: (aadhaarLast4, aadhaarStatus) =>
        set({ aadhaarLast4, aadhaarStatus, step: "PLATFORM_ID" }),

      setPlatformId: (platformId, platformVerified) =>
        set({ platformId, platformVerified, step: "SELFIE" }),

      setSelfie: (selfieVerified) => 
        set({ selfieVerified, step: "LOCATION" }),

      setLocation: (location) => 
        set({ location, step: "WORK" }),

      setWorkProfile: (workHours, peakHour) =>
        set({ workHours, peakHour, step: "INCOME" }),

      setIncome: (incomeRange) => 
        set({ incomeRange, step: "UPI" }),

      setUPI: (upiId, upiAutopay) =>
        set({ upiId, upiAutopay, step: "DONE" }),

      complete: () => set({ step: "DONE" }),

      reset: () => set(initialState),
    }),
    makePersistConfig<OnboardingState>("onboarding", 1, (state) => ({
      step: state.step,
      consentGiven: state.consentGiven,
      activityDetectionEnabled: state.activityDetectionEnabled,
      platform: state.platform,
      platformId: state.platformId,
      platformVerified: state.platformVerified,
      aadhaarLast4: state.aadhaarLast4,
      aadhaarStatus: state.aadhaarStatus,
      selfieVerified: state.selfieVerified,
      location: state.location,
      workHours: state.workHours,
      peakHour: state.peakHour,
      incomeRange: state.incomeRange,
      upiId: state.upiId,
      upiAutopay: state.upiAutopay,
    }))
  )
);
