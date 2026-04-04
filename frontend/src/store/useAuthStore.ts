import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makePersistConfig } from "./middleware/persist";

interface AuthState {
  phone: string;
  otpVerified: boolean;
  isRegistered: boolean;
  hasMpin: boolean;
  onboardingComplete: boolean;
  token: string | null;
  workerId: string | null;
  trustScore: number;
  name: string;
  // Actions
  setPhone: (phone: string) => void;
  setAuth: (data: {
    token: string;
    is_registered: boolean;
    has_mpin: boolean;
    worker_id: string | null;
    phone?: string;
  }) => void;
  setOnboardingComplete: (status: boolean) => void;
  setHasMpin: (status: boolean) => void;
  setTrustScore: (score: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      phone: "",
      otpVerified: false,
      isRegistered: false,
      hasMpin: false,
      onboardingComplete: false,
      token: null,
      workerId: null,
      trustScore: 78,
      name: "Rider",

      setPhone: (phone) => set({ phone }),

      setAuth: (data) =>
        set({
          otpVerified: true,
          token: data.token,
          isRegistered: data.is_registered,
          hasMpin: data.has_mpin,
          workerId: data.worker_id,
          phone: data.phone || undefined,
        }),

      setOnboardingComplete: (status) => set({ onboardingComplete: status }),
      setHasMpin: (status) => set({ hasMpin: status }),

      setTrustScore: (trustScore) => set({ trustScore }),

      logout: () =>
        set({
          otpVerified: false,
          isRegistered: false,
          hasMpin: false,
          onboardingComplete: false,
          token: null,
          workerId: null,
          phone: "",
          trustScore: 78,
          name: "Rider",
        }),
    }),
    makePersistConfig<AuthState>("auth", 4, (state) => ({
      phone: state.phone,
      otpVerified: state.otpVerified,
      isRegistered: state.isRegistered,
      hasMpin: state.hasMpin,
      onboardingComplete: state.onboardingComplete,
      token: state.token,
      workerId: state.workerId,
      trustScore: state.trustScore,
      name: state.name,
    }))
  )
);

