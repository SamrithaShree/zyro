import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.zyro.in/v1";

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
    const { config, response } = error;

    // 401 — logout
    if (response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Retry logic — 2 attempts on network errors
    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount < 2 && !response) {
      config.__retryCount++;
      await new Promise((r) => setTimeout(r, 800 * config.__retryCount));
      return api(config);
    }

    // Global error toast
    const message =
      response?.data?.message || "Something went wrong. Please try again.";
    toast.error(message);

    return Promise.reject(error);
  }
);

// Helper to cancel requests
export function createCancellable() {
  const controller = new AbortController();
  return { signal: controller.signal, cancel: () => controller.abort() };
}
