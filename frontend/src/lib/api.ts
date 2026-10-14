import axios, { AxiosError } from "axios";
import type { ApiError } from "@/types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

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