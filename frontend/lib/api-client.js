import axios from "axios";
import { env } from "@/config/env";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
});

// Attach the stored access token to every request.
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("synqro_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// The backend (app/core/error_handlers.py) always returns errors as
// { error: { message, code } }. Normalize that into a plain Error with
// a readable .message, so callers never have to reach into response.data
// themselves.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendMessage = error?.response?.data?.error?.message;
    const normalized = new Error(backendMessage || error.message || "Something went wrong.");
    normalized.status = error?.response?.status;
    normalized.code = error?.response?.data?.error?.code;
    return Promise.reject(normalized);
  }
);
