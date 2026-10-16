"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import { btnPrimary, inputClass } from "@/lib/ui";
import AuthShell from "@/components/AuthShell";
import FormField from "@/components/FormField";

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export default function RegisterPage() {
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function validate(): FormErrors {
    const found: FormErrors = {};
    if (!fullName.trim()) found.fullName = "Full name is required";

    if (!email.trim()) {
      found.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      found.email = "Enter a valid email address";
    }

    if (!password) {
      found.password = "Password is required";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(password)) {
      found.password = "Use 8 to 72 characters with at least one letter and one number";
    }

    if (confirm !== password) found.confirm = "Passwords do not match";
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
      await register({ fullName: fullName.trim(), email: email.trim(), password });
      setDone(true);
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthShell title="Account created" subtitle="You can now sign in with your email and password.">
        <Link href="/login" className={`w-full ${btnPrimary}`}>
          Go to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Use the email address your administrator registered for you."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField label="Full name" htmlFor="fullName" error={errors.fullName}>
          <input
            id="fullName"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password}
          hint="8 to 72 characters, with at least one letter and one number."
        >
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <FormField label="Confirm password" htmlFor="confirm" error={errors.confirm}>
          <input
            id="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </FormField>

        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <button type="submit" disabled={submitting} className={`w-full ${btnPrimary}`}>
          {submitting ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}