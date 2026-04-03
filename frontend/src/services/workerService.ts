import { api } from "./api";

export interface WorkerInfo {
  workerId: string;
  phone: string;
  platform: string;
  zone: string;
  incomeBand: string;
  trustScore: number;
}

export const workerService = {
  getMe: async (): Promise<WorkerInfo> => {
    const { data } = await api.get("/workers/me");
    return data.data;
  },

  register: async (platform: string, zone: string, incomeBand: string): Promise<WorkerInfo> => {
    const { data } = await api.post("/workers/register", {
      platform,
      zone,
      income_band: incomeBand,
    });
    return data.data;
  },
};
