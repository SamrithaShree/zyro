import { api } from "./api";

export interface PolicyQuote {
  premiumAmount: number;
  hourlyBenefit: number;
  weeklyCap: number;
}

export interface PolicyInfo extends PolicyQuote {
  policyId: string;
  status: string;
  validUntil: string;
}

export const policyService = {
  getQuote: async (zone: string, incomeBand: string): Promise<PolicyQuote> => {
    const { data } = await api.post("/policies/quote", { zone, income_band: incomeBand });
    return data.data;
  },

  activatePolicy: async (): Promise<any> => {
    const { data } = await api.post("/policies/activate");
    return data.data;
  },

  getActivePolicy: async (): Promise<PolicyInfo | null> => {
    const { data } = await api.get("/policies/active");
    return data.data;
  },
};
