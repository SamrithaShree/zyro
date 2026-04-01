import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makePersistConfig } from "./middleware/persist";

interface AuthState {
  phone: string;
  isAuthenticated: boolean;
  token: string | null;
  trustScore: number;
  name: string;
  // Actions
  setPhone: (phone: string) => void;
  setAuthenticated: (token: string, name?: string) => void;
  setTrustScore: (score: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      phone: "",
      isAuthenticated: false,
      token: null,
      trustScore: 78,
      name: "Rider",

      setPhone: (phone) => set({ phone }),

      setAuthenticated: (token, name = "Rider") =>
        set({ isAuthenticated: true, token, name }),

      setTrustScore: (trustScore) => set({ trustScore }),

      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
          phone: "",
          trustScore: 78,
          name: "Rider",
        }),
    }),
    makePersistConfig<AuthState>("auth", 1, (state) => ({
      phone: state.phone,
      isAuthenticated: state.isAuthenticated,
      token: state.token,
      trustScore: state.trustScore,
      name: state.name,
    }))
  )
);
