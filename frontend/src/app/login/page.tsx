"use client";

import { useState } from "react";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState<string | null>(null);

  function validate(): FormErrors {
    const found: FormErrors = {};
    if (!email.trim()) {
      found.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      found.email = "Enter a valid email address";
    }
    if (!password) {
      found.password = "Password is required";
    } else if (password.length < 6) {
      found.password = "Password must be at least 6 characters";
    }
    return found;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice(null);

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // TODO (Day 4): call POST /api/auth/login, store the JWT, redirect to /dashboard
    setNotice("Form is valid. Login will be connected to the backend on Day 4.");
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {notice && (
          <p className="rounded bg-blue-50 p-3 text-sm text-blue-700">{notice}</p>
        )}

        <button
          type="submit"
          className="w-full rounded bg-slate-900 py-2 text-white hover:bg-slate-700"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}