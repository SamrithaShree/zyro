import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makePersistConfig } from "./middleware/persist";

interface AuthState {
  phone: string;
  isAuthenticated: boolean;
  isRegistered: boolean;
  hasMpin: boolean;
  token: string | null;
  workerId: string | null;
  trustScore: number;
  name: string;
  // Actions
  setPhone: (phone: string) => void;
  setAuth: (data: {
    token: string;
    isRegistered: boolean;
    hasMpin: boolean;
    workerId: string | null;
    phone?: string;
  }) => void;
  setTrustScore: (score: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      phone: "",
      isAuthenticated: false,
      isRegistered: false,
      hasMpin: false,
      token: null,
      workerId: null,
      trustScore: 78,
      name: "Rider",

      setPhone: (phone) => set({ phone }),

      setAuth: (data) =>
        set({
          isAuthenticated: true,
          token: data.token,
          isRegistered: data.isRegistered,
          hasMpin: data.hasMpin,
          workerId: data.workerId,
          phone: data.phone || undefined,
        }),

      setTrustScore: (trustScore) => set({ trustScore }),

      logout: () =>
        set({
          isAuthenticated: false,
          isRegistered: false,
          hasMpin: false,
          token: null,
          workerId: null,
          phone: "",
          trustScore: 78,
          name: "Rider",
        }),
    }),
    makePersistConfig<AuthState>("auth", 1, (state) => ({
      phone: state.phone,
      isAuthenticated: state.isAuthenticated,
      isRegistered: state.isRegistered,
      hasMpin: state.hasMpin,
      token: state.token,
      workerId: state.workerId,
      trustScore: state.trustScore,
      name: state.name,
    }))
  )
);
