import { api } from "@/lib/api";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types";

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>("/api/auth/register", data);
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await api.get<User>("/api/auth/me");
    return response.data;
  },
};