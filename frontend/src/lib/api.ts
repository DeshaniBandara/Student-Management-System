import axios, { AxiosError } from "axios";
import type { ApiError } from "@/types";
import { authStorage } from "@/lib/authStorage";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// Attach the token to every request
api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is rejected, clear it and send the user to the login page
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? "";
    const isAuthCall = url.includes("/api/auth/login") || url.includes("/api/auth/register");

    if (error.response?.status === 401 && !isAuthCall && typeof window !== "undefined") {
      authStorage.clear();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiError>;

  if (axiosError.response?.data) {
    const data = axiosError.response.data;
    if (data.validationErrors) {
      return Object.values(data.validationErrors).join(", ");
    }
    if (data.message) {
      return data.message;
    }
  }
  if (axiosError.request) {
    return "Cannot reach the server. Please check that the backend is running.";
  }
  return "Something went wrong. Please try again.";
}