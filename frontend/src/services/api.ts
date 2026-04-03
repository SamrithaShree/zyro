import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// Simple case transformation utilities
const toCamel = (o: any): any => {
  if (o instanceof Array) return o.map((i) => toCamel(i));
  if (o !== null && o !== undefined && o.constructor === Object) {
    return Object.keys(o).reduce(
      (acc, key) => ({
        ...acc,
        [key.replace(/([-_][a-z])/gi, (m) => m.toUpperCase().replace("-", "").replace("_", ""))]: toCamel(o[key]),
      }),
      {}
    );
  }
  return o;
};

const toSnake = (o: any): any => {
  if (o instanceof Array) return o.map((i) => toSnake(i));
  if (o !== null && o !== undefined && o.constructor === Object) {
    return Object.keys(o).reduce(
      (acc, key) => ({
        ...acc,
        [key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)]: toSnake(o[key]),
      }),
      {}
    );
  }
  return o;
};

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — inject auth token + convert to snake_case
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data) {
    config.data = toSnake(config.data);
  }
  return config;
});

// Response interceptor — handle errors + convert to camelCase
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = toCamel(response.data);
    }
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // 401 — logout
    if (response?.status === 401) {
      useAuthStore.getState().logout();
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // Global error toast
    const message = response?.data?.detail || response?.data?.message || "Something went wrong.";
    toast.error(message);

    return Promise.reject(error);
  }
);
