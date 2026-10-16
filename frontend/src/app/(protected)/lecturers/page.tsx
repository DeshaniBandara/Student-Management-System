"use client";

import { useEffect, useState } from "react";
import { Inbox, Plus } from "lucide-react";
import type { Course, User } from "@/types";
import { adminService } from "@/services/adminService";
import { courseService } from "@/services/courseService";
import { getErrorMessage } from "@/lib/api";
import { btnPrimary, btnSecondary, inputClass, rowBtnDanger } from "@/lib/ui";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import FormField from "@/components/FormField";
import Loading from "@/components/Loading";
import Modal from "@/components/Modal";
import PageHeader from "@/components/PageHeader";

const emptyForm = { fullName: "", email: "", password: "" };

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

async function fetchData() {
  const [lecturers, courses] = await Promise.all([
    adminService.getLecturers(),
    courseService.getAll(),
  ]);
  return { lecturers, courses };
}

export default function LecturersPage() {
  const toast = useToast();
  const confirm = useConfirm();

  const [lecturers, setLecturers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchData()
      .then((data) => {
        if (ignore) return;
        setLecturers(data.lecturers);
        setCourses(data.courses);
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function reload() {
    try {
      const data = await fetchData();
      setLecturers(data.lecturers);
      setCourses(data.courses);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openCreate() {
    setForm(emptyForm);
    setErrors({});
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    if (!saving) setModalOpen(false);
  }

  function validate(): FormErrors {
    const found: FormErrors = {};
    if (!form.fullName.trim()) found.fullName = "Full name is required";

    if (!form.email.trim()) {
      found.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      found.email = "Enter a valid email address";
    }

    if (!form.password) {
      found.password = "Password is required";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(form.password)) {
      found.password = "Use 8 to 72 characters with at least one letter and one number";
    }
    return found;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await adminService.createLecturer({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success("Lecturer added");
      setModalOpen(false);
      await reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(lecturer: User) {
    const ok = await confirm({
      title: "Delete lecturer",
      message: `Delete ${lecturer.fullName}? Their login will stop working.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    try {
      await adminService.deleteLecturer(lecturer.id);
      toast.success("Lecturer deleted");
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const courseCount = (lecturerId: number) =>
    courses.filter((c) => c.lecturer?.id === lecturerId).length;

  const filtered = lecturers.filter((l) =>
    `${l.fullName} ${l.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lecturers"
        description="Create lecturer accounts. Assign them to courses on the Courses page."
        action={
          <button onClick={openCreate} className={btnPrimary}>
            <Plus size={16} /> Add lecturer
          </button>
        }
      />

      {loading ? (
        <Loading message="Loading lecturers..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : (
        <div className="space-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            aria-label="Search lecturers"
            className={`md:w-80 ${inputClass}`}
          />

          {filtered.length === 0 ? (
            lecturers.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No lecturers yet"
                description="Add your first lecturer so you can assign them to courses."
                action={
                  <button onClick={openCreate} className={btnPrimary}>
                    Add lecturer
                  </button>
                }
              />
            ) : (
              <EmptyState
                icon={Inbox}
                title="No lecturers match your search"
                description="Try a different name or email."
              />
            )
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Courses</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => {
                    const count = courseCount(l.id);
                    return (
                      <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{l.fullName}</td>
                        <td className="px-4 py-3">{l.email}</td>
                        <td className="px-4 py-3">
                          {count > 0 ? count : <Badge tone="amber">None assigned</Badge>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDelete(l)} className={rowBtnDanger}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} title="Add a lecturer" onClose={closeModal}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Full name" htmlFor="fullName" error={errors.fullName}>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              autoFocus
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

          <FormField
            label="Temporary password"
            htmlFor="password"
            error={errors.password}
            hint="8 to 72 characters, with at least one letter and one number."
          >
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>

          {formError && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeModal} className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? "Saving..." : "Add lecturer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}