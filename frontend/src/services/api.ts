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
  (response) => {
    // If backend uses GenericResponse { status, message, data }, 
    // we might want to return response.data.data directly for convenience,
    // but let's keep the full response.data for status checks if needed.
    return response;
  },
  async (error) => {
    const { response } = error;

    if (response?.status === 401) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // Backend returns detail as string or object
    const detail = response?.data?.detail;
    const message = typeof detail === 'string' ? detail : (detail?.message || response?.data?.message || "Something went wrong.");
    
    // Don't toast for validation errors handled by forms
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

// Helper to normalize phone numbers
const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return phone;
};

// Unified API client
export const apiService = {
  auth: {
    sendOtp: (phone: string) => 
      api.post<GenericResponse<{ otp: string }>>("/auth/send-otp", { phone: normalizePhone(phone) }),
    
    verifyOtp: (phone: string, otp: string) => 
      api.post<GenericResponse>("/auth/verify-otp", { phone: normalizePhone(phone), otp }),
    
    permissions: (payload: { location_consent: boolean; notification_consent: boolean; data_consent: boolean }) =>
      api.post<GenericResponse>("/auth/permissions", payload),
    
    sendAadhaarOtp: (aadhaar_number: string) =>
      api.post<GenericResponse<{ otp: string }>>("/auth/send-aadhaar-otp", { aadhaar_number }),
    
    verifyAadhaarOtp: (otp: string) =>
      api.post<GenericResponse>("/auth/verify-aadhaar-otp", { otp }),
    
    verifySelfie: (payload: string) =>
      api.post<GenericResponse>("/auth/verify-selfie", { selfie_mock_payload: payload }),
    
    setMpin: (mpin: string) =>
      api.post<GenericResponse>("/auth/set-mpin", { mpin }),
    
    loginMpin: (phone: string, mpin: string) =>
      api.post<GenericResponse>("/auth/login-mpin", { phone: normalizePhone(phone), mpin }),
    
    getOnboardingStatus: () =>
      api.get<GenericResponse>("/auth/onboarding-status"),
    
    logout: () => api.post<GenericResponse>("/auth/logout"),
  },
  
  claims: {
    getMyClaims: () =>
      api.get<GenericResponse<any[]>>("/claims/me"),
    
    getClaim: (id: string) =>
      api.get<GenericResponse<any>>(`/claims/${id}`),
    
    approve: (id: string) =>
      api.post<GenericResponse>(`/claims/${id}/approve`),
    
    payout: (id: string) =>
      api.post<GenericResponse>(`/claims/${id}/payout`),
  },

  worker: {
    getMe: () =>
      api.get<GenericResponse>("/workers/me"),

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
    getStatus: () =>
      api.get<GenericResponse>("/policies/status"),

    getQuote: (zone: string, income_band: string) =>
      api.post<GenericResponse>("/policies/quote", { zone, income_band }),
    
    acknowledge: (payload: { premium_acknowledged: boolean; coverage_acknowledged: boolean; exclusions_acknowledged: boolean; terms_accepted: boolean; privacy_accepted: boolean }) =>
      api.post<GenericResponse>("/policies/acknowledge", payload),
    
    activate: (payload: { tier: string }) =>
      api.post<GenericResponse>("/policies/activate", payload),
  },

  claims: {
    getMyClaims: () =>
      api.get<any[]>("/claims/me"),
    
    getClaim: (claimId: string) =>
      api.get<any>(`/claims/${claimId}`),
  }
};
