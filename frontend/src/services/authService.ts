import { api } from "./api";

export interface AuthResponse {
  token: string;
  isRegistered: boolean;
  hasMpin: boolean;
  workerId: string | null;
}

export const authService = {
  sendOtp: async (phone: string) => {
    const { data } = await api.post("/auth/send-otp", { phone });
    return data;
  },

  verifyOtp: async (phone: string, otp: string): Promise<AuthResponse> => {
    const { data } = await api.post("/auth/verify-otp", { phone, otp });
    return data.data;
  },

  loginMpin: async (phone: string, mpin: string): Promise<AuthResponse> => {
    const { data } = await api.post("/auth/login-mpin", { phone, mpin });
    return data.data;
  },

  setMpin: async (mpin: string) => {
    const { data } = await api.post("/auth/set-mpin", { mpin });
    return data;
  },

  logout: async () => {
    const { data } = await api.post("/auth/logout");
    return data;
  },
};
