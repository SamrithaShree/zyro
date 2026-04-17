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

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    // Only force-logout on 401 for core auth endpoints.
    // A 401 on /workers/register or /policies/status must NOT wipe
    // the session — it would log the user out right after onboarding.
    const authOnlyPaths = ["/auth/onboarding-status", "/auth/login-mpin"];
    const isAuthEndpoint = authOnlyPaths.some((p) => config?.url?.includes(p));

    if (response?.status === 401 && isAuthEndpoint) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    const detail = response?.data?.detail;
    const message = typeof detail === 'string' ? detail : (detail?.message || response?.data?.message || "Something went wrong.");
    
    // Handle invalid transition by syncing store (best-effort, non-blocking)
    if (
      message === "Invalid onboarding transition" ||
      (typeof detail === 'object' && detail?.message === "Invalid onboarding transition")
    ) {
      const { useOnboardingStore } = await import("../store/useOnboardingStore");
      useOnboardingStore.getState().syncWithBackend().catch(() => {});
    }

    // Suppress noisy toasts for background dashboard/activity calls
    const silentPaths = ["/workers/me", "/policies/status", "/claims/me", "/events/active"];
    const isSilent = silentPaths.some((p) => config?.url?.includes(p));
    if (response?.status !== 422 && !isSilent) {
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

    getSummary: () =>
      api.get<any>("/claims/summary"),

    approveClaim: (id: string) =>
      api.post<any>(`/claims/${id}/approve`),
  },

  events: {
    simulate: (payload: { zone: string; trigger_type: string; severity: number; source: string; description?: string }) =>
      api.post<any>("/events/simulate", payload),
    
    getActive: () =>
      api.get<any>("/events/active"),
  }
};
