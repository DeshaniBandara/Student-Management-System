"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import { homeFor } from "@/lib/roles";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Go to the right home page
  useEffect(() => {
    if (!loading && user) {
      router.replace(homeFor(user.role));
    }
  }, [loading, user, router]);

  function validate(): FormErrors {
    const found: FormErrors = {};
    if (!email.trim()) {
      found.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      found.email = "Enter a valid email address";
    }
    if (!password) {
      found.password = "Password is required";
    }
    return found;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const loggedIn = await login({ email: email.trim(), password });
      router.replace(homeFor(loggedIn.role));
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full rounded border border-slate-300 px-3 py-2";

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">Student Management</h1>
          <p className="text-sm text-slate-500">Sign in to your account</p>
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        {serverError && (
          <p className="rounded bg-red-50 p-3 text-sm text-red-700">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-slate-900 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm text-slate-600">
          New student?{" "}
          <Link href="/register" className="font-medium text-slate-900 underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}