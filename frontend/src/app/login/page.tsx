"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import { homeFor } from "@/lib/roles";
import { btnPrimary, inputClass } from "@/lib/ui";
import AuthShell from "@/components/AuthShell";
import FormField from "@/components/FormField";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your account to continue.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField label="Email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password}>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </FormField>

        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <button type="submit" disabled={submitting} className={`w-full ${btnPrimary}`}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm text-slate-600">
          New student?{" "}
          <Link href="/register" className="font-medium text-brand-700 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}