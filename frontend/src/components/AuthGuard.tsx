"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Role = "ADMIN" | "LECTURER" | "STUDENT";

interface AuthGuardProps {
  children: React.ReactNode;
  roles?: Role[];
}

export default function AuthGuard({ children, roles }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not logged in → go to login
    if (!user) {
      router.replace("/login");
      return;
    }

    // Logged in but wrong role → send to their own dashboard
    if (roles && !roles.includes(user.role as Role)) {
      router.replace("/dashboard");
    }
  }, [user, loading, roles, router]);

  // While session is being checked, render nothing
  if (loading) return null;

  // Not logged in
  if (!user) return null;

  // Wrong role
  if (roles && !roles.includes(user.role as Role)) return null;

  return <>{children}</>;
}