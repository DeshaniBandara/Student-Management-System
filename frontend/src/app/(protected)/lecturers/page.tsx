"use client";

import { useEffect, useState } from "react";
import { Inbox, Plus, Eye, EyeOff } from "lucide-react"; // ✅ Eye සහ EyeOff අයිකන import කළා
import type { LecturerRequest, User } from "@/types";
import { lecturerService } from "@/services/lecturerService";
import { getErrorMessage } from "@/lib/api";
import { btnPrimary, btnSecondary, inputClass, rowBtn, rowBtnDanger } from "@/lib/ui";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import FormField from "@/components/FormField";
import Loading from "@/components/Loading";
import Modal from "@/components/Modal";
import PageHeader from "@/components/PageHeader";

const emptyForm: LecturerRequest = {
  fullName: "",
  email: "",
  nic: "",
  password: "",
  confirmPassword: "",
};

interface FormErrors {
  fullName?: string;
  email?: string;
  nic?: string;
  password?: string;
  confirmPassword?: string;
}

export default function LecturersPage() {
  const toast = useToast();
  const { confirm } = useConfirm();

  const [lecturers, setLecturers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<LecturerRequest>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ✅ Password එක පෙන්නනවද නැද්ද කියන State එක (දෙකට වෙන වෙනම)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await lecturerService.getAll();
      setLecturers(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setFormError(null);
    setShowPassword(false); // Modal එක ඇරෙද්දි ආයෙ reset කරන්න
    setShowConfirmPassword(false);
    setModalOpen(true);
  }

  function openEdit(lecturer: User) {
    setEditingId(lecturer.id);
    setForm({
      fullName: lecturer.fullName,
      email: lecturer.email,
      nic: lecturer.nic ?? "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
    setFormError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setModalOpen(true);
  }

  function validate(): FormErrors {
    const found: FormErrors = {};
    if (!form.fullName.trim()) found.fullName = "Full name is required";

    if (!form.email.trim()) {
      found.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      found.email = "Enter a valid email address";
    }

    if (!form.nic.trim()) {
      found.nic = "NIC is required";
    } else if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(form.nic.trim())) {
      found.nic = "Enter a valid NIC (e.g., 123456789V or 200012345678)";
    }

    if (editingId === null && !form.password) {
      found.password = "Password is required";
    } else if (form.password && form.password.length < 8) {
      found.password = "Password must be at least 8 characters";
    }

    if (form.password !== form.confirmPassword) {
      found.confirmPassword = "Passwords do not match";
    }

    return found;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      if (editingId === null) {
        await lecturerService.create(form);
        toast.success("Lecturer added");
      } else {
        await lecturerService.update(editingId, form);
        toast.success("Lecturer updated");
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      const responseData = err.response?.data || err;
      if (responseData && responseData.validationErrors) {
        setErrors(responseData.validationErrors);
        setFormError("Please fix the highlighted errors.");
      } else {
        setFormError(getErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(lecturer: User) {
    const ok = await confirm({
      title: "Delete lecturer",
      message: `Delete ${lecturer.fullName}? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    try {
      await lecturerService.delete(lecturer.id);
      toast.success("Lecturer deleted");
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lecturers"
        description="Manage lecturer accounts."
        action={
          <button onClick={openCreate} className={btnPrimary}>
            <Plus size={16} /> Add lecturer
          </button>
        }
      />

      {loading ? (
        <Loading message="Loading lecturers..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">NIC</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lecturers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No lecturers found. Add one to get started.
                  </td>
                </tr>
              ) : (
                lecturers.map((l) => (
                  <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{l.fullName}</td>
                    <td className="px-4 py-3">{l.email}</td>
                    <td className="px-4 py-3">{l.nic}</td>
                    <td className="space-x-2 px-4 py-3 text-right">
                      <button onClick={() => openEdit(l)} className={rowBtn}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(l)} className={rowBtnDanger}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editingId === null ? "Add a lecturer" : "Edit lecturer"}
        onClose={() => !saving && setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Full name" htmlFor="fullName" error={errors.fullName}>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>

          <FormField label="Email" htmlFor="email" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>

          <FormField label="NIC" htmlFor="nic" error={errors.nic}>
            <input
              id="nic"
              name="nic"
              value={form.nic}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* ✅ Temporary Password Field එක */}
            <FormField 
              label="Temporary Password" 
              htmlFor="password" 
              error={errors.password}
              hint={editingId !== null ? "Leave blank to keep current password." : "Min 8 characters."}
            >
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} // State එක අනුව type එක වෙනස් වෙනවා
                  value={form.password || ""}
                  onChange={handleChange}
                  className={`${inputClass} pr-10`} // අයිකනයට ඉඩ තියන්න pr-10 දැම්මා
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </FormField>
            
            {/* ✅ Confirm Password Field එක */}
            <FormField label="Confirm Password" htmlFor="confirmPassword" error={errors.confirmPassword}>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"} // State එක අනුව type එක වෙනස් වෙනවා
                  value={form.confirmPassword || ""}
                  onChange={handleChange}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </FormField>
          </div>

          {formError && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? "Saving..." : editingId === null ? "Add lecturer" : "Save changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}