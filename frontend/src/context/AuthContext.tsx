"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { LoginRequest, RegisterRequest, User } from "@/types";
import { authService } from "@/services/authService";
import { authStorage } from "@/lib/authStorage";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session when the app loads
  useEffect(() => {
    let ignore = false;

    const request = authStorage.getToken() ? authService.me() : Promise.resolve(null);

    request
      .then((current) => {
        if (!ignore) setUser(current);
      })
      .catch(() => {
        authStorage.clear();
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authService.login(data);
    authStorage.setToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await authService.register(data);
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}