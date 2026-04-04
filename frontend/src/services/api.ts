import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — inject auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle errors and extract data from GenericResponse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error;

    if (response?.status === 401) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    const detail = response?.data?.detail;
    const message = typeof detail === 'string' ? detail : (detail?.message || response?.data?.message || "Something went wrong.");
    
    // Handle invalid transition by syncing store
    if (message === "Invalid onboarding transition" || (typeof detail === 'object' && detail?.message === "Invalid onboarding transition")) {
      const { useOnboardingStore } = await import("../store/useOnboardingStore");
      useOnboardingStore.getState().syncWithBackend();
    }

    if (response?.status !== 422) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export interface GenericResponse<T = any> {
  status: "SUCCESS" | "ERROR";
  message: string;
  data: T;
}

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return phone;
};

export const apiService = {
  auth: {
    sendOtp: (phone: string) => 
      api.post<GenericResponse>("/auth/send-otp", { phone: normalizePhone(phone) }),
    
    verifyOtp: (phone: string, otp: string) => 
      api.post<GenericResponse>("/auth/verify-otp", { phone: normalizePhone(phone), otp }),
    
    permissions: (payload: { location_consent: boolean; notification_consent: boolean; data_consent: boolean }) =>
      api.post<GenericResponse>("/auth/permissions", payload),
    
    sendAadhaarOtp: (aadhaar_number: string) =>
      api.post<GenericResponse<{ otp: string }>>("/auth/send-aadhaar-otp", { aadhaar_number }),
    
    verifyAadhaarOtp: (otp: string) =>
      api.post<GenericResponse>("/auth/verify-aadhaar-otp", { otp }),
    
    verifySelfie: (payload: string) =>
      api.post<GenericResponse<{ confidence_score: number }>>("/auth/verify-selfie", { selfie_mock_payload: payload }),

    setMpin: (mpin: string) =>
      api.post<GenericResponse>("/auth/set-mpin", { mpin }),

    loginMpin: (phone: string, mpin: string) =>
      api.post<GenericResponse>("/auth/login-mpin", { phone: normalizePhone(phone), mpin }),

    getOnboardingStatus: () =>
      api.get<GenericResponse>("/auth/onboarding-status"),
    
    logout: () => api.post<GenericResponse>("/auth/logout"),
  },
  
  worker: {
    getMe: () =>
      api.post<GenericResponse>("/workers/register", { confirm: true }), // Using register as idempotent me
    
    captureLocation: (payload: { lat?: number; lng?: number; city?: string; zone?: string }) =>
      api.post<GenericResponse>("/workers/location", payload),
    
    saveWorkProfile: (payload: { platform: string; working_hours_per_day: number; days_worked_per_week: number; income_band: string }) =>
      api.post<GenericResponse>("/workers/work-profile", payload),
    
    configureUpi: (upi_id: string) =>
      api.post<GenericResponse>("/workers/upi", { upi_id }),
    
    register: () =>
      api.post<GenericResponse>("/workers/register", { confirm: true }),
  },

  policy: {
    getQuote: (zone?: string, income_band?: string) =>
      api.post<GenericResponse>("/policies/quote", { zone, income_band }),
    
    acknowledge: (payload: any) =>
      api.post<GenericResponse>("/policies/acknowledge", payload),
    
    activate: (payload: { tier: string }) =>
      api.post<GenericResponse>("/policies/activate", payload),
    
    getStatus: () =>
      api.get<any>("/policies/status"),
  },

  claims: {
    getMyClaims: () =>
      api.get<any[]>("/claims/me"),
    
    getClaim: (id: string) =>
      api.get<any>(`/claims/${id}`),
    
    payout: (id: string) =>
      api.post<GenericResponse>(`/claims/${id}/payout`),
  },

  events: {
    simulate: (payload: { zone: string; trigger_type: string; severity: number; source: string; description?: string }) =>
      api.post<any>("/events/simulate", payload),
    
    getActive: () =>
      api.get<any>("/events/active"),
  }
};
