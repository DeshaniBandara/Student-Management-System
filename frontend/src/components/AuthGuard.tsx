"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { homeFor, requiredRoles } from "@/lib/roles";
import Loading from "@/components/Loading";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <Loading message="Checking your session..." />;
  }

  const allowed = requiredRoles(pathname);
  if (allowed && !allowed.includes(user.role)) {
    return (
      <div className="mx-auto max-w-md rounded-lg bg-white p-6 text-center shadow">
        <h1 className="text-xl font-bold">Access denied</h1>
        <p className="mt-2 text-slate-600">You do not have permission to view this page.</p>
        <Link
          href={homeFor(user.role)}
          className="mt-4 inline-block rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          Go to my home page
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}