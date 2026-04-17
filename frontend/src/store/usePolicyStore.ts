import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makePersistConfig } from "./middleware/persist";
import { apiService } from "../services/api";

export interface PlanOption {
  tier: string;
  premium_amount: number;
  hourly_benefit: number;
  weekly_cap: number;
  covered_triggers: string[];
  replacement_fraction: number;
  expected_weekly_loss: number;
  intended_protection_level: string;
  pricing_drivers: string[];
  explanation: string;
}

interface PolicyState {
  activePolicy: any | null;
  quotes: PlanOption[];
  recommendedTier: string | null;
  isLoading: boolean;

  // Actions
  fetchStatus: () => Promise<void>;
  fetchQuotes: (zone: string, incomeBand: string) => Promise<void>;
  activatePolicy: (tier: string) => Promise<void>;
  reset: () => void;
}

export const usePolicyStore = create<PolicyState>()(
  persist(
    (set) => ({
      activePolicy: null,
      quotes: [],
      recommendedTier: null,
      isLoading: false,

      fetchStatus: async () => {
        set({ isLoading: true });
        try {
          const res = await apiService.policy.getStatus();
          if (res.data.status === "SUCCESS") {
            set({ activePolicy: res.data.data });
          }
        } catch (error) {
          console.error("Fetch policy status failed", error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchQuotes: async (zone, incomeBand) => {
        set({ isLoading: true });
        try {
          const res = await apiService.policy.getQuote(zone, incomeBand);
          if (res.data.status === "SUCCESS") {
            set({
              quotes: res.data.data.plans,
              recommendedTier: res.data.data.recommended_tier,
            });
          }
        } catch (error) {
          console.error("Fetch quotes failed", error);
        } finally {
          set({ isLoading: false });
        }
      },

      activatePolicy: async (tier) => {
        set({ isLoading: true });
        try {
          const res = await apiService.policy.activate(tier);
          if (res.data.status === "SUCCESS") {
            const statusRes = await apiService.policy.getStatus();
            if (statusRes.data.status === "SUCCESS") {
              set({ activePolicy: statusRes.data.data });
            }
          }
        } catch (error) {
          console.error("Policy activation failed", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      reset: () => set({ activePolicy: null, quotes: [], recommendedTier: null }),
    }),
    makePersistConfig<PolicyState>("policy_v2", 1, (state) => ({
      activePolicy: state.activePolicy,
      quotes: state.quotes,
      recommendedTier: state.recommendedTier,
    }))
  )
);
