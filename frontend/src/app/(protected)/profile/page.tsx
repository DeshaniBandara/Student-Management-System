"use client";

import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { btnPrimary, btnSecondary, inputClass } from "@/lib/ui";
import FormField from "@/components/FormField";
import PageHeader from "@/components/PageHeader";

export default function ProfilePage() {
  const toast = useToast();
  
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<any>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev: any) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    // Frontend Validation
    const found: any = {};
    if (!form.currentPassword) found.currentPassword = "Current password is required";
    if (!form.newPassword) {
      found.newPassword = "New password is required";
    } else if (form.newPassword.length < 8) {
      found.newPassword = "Password must be at least 8 characters";
    }
    if (form.newPassword !== form.confirmPassword) {
      found.confirmPassword = "Passwords do not match";
    }

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await authService.changePassword(form);
      toast.success("Password changed successfully!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); // Form එක clear කරනවා
    } catch (err: any) {
      const responseData = err.response?.data || err;
      if (responseData && responseData.validationErrors) {
        setErrors(responseData.validationErrors);
      } else {
        setServerError(getErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your account settings and update your password."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
            <p className="text-sm text-slate-500">Ensure your account is using a long, random password to stay secure.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Current Password" htmlFor="currentPassword" error={errors.currentPassword}>
            <div className="relative">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={form.currentPassword}
                onChange={handleChange}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>

          <FormField label="New Password" htmlFor="newPassword" error={errors.newPassword} hint="Min 8 characters, at least one letter and one number.">
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showNew ? "text" : "password"}
                value={form.newPassword}
                onChange={handleChange}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>

          <FormField label="Confirm New Password" htmlFor="confirmPassword" error={errors.confirmPassword}>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showNew ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>

          {serverError && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}