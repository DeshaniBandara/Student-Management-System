"use client";

import { useEffect, useState } from "react";
import { Inbox, Plus } from "lucide-react";
import type { Course, CourseRequest, User } from "@/types";
import { courseService } from "@/services/courseService";
import { adminService } from "@/services/adminService";
import { getErrorMessage } from "@/lib/api";
import { btnPrimary, btnSecondary, inputClass, rowBtn, rowBtnDanger } from "@/lib/ui";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import FormField from "@/components/FormField";
import Loading from "@/components/Loading";
import Modal from "@/components/Modal";
import PageHeader from "@/components/PageHeader";

const emptyForm = { title: "", description: "", credits: "", lecturerId: "" };

interface FormErrors {
  title?: string;
  credits?: string;
}

async function fetchData() {
  const [courses, lecturers] = await Promise.all([
    courseService.getAll(),
    adminService.getLecturers(),
  ]);
  return { courses, lecturers };
}

export default function CoursesPage() {
  const toast = useToast();
  const confirm = useConfirm();

  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchData()
      .then((data) => {
        if (ignore) return;
        setCourses(data.courses);
        setLecturers(data.lecturers);
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
      setCourses(data.courses);
      setLecturers(data.lecturers);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(course: Course) {
    setEditingId(course.id);
    setForm({
      title: course.title,
      description: course.description ?? "",
      credits: String(course.credits),
      lecturerId: course.lecturer ? String(course.lecturer.id) : "",
    });
    setErrors({});
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    if (!saving) setModalOpen(false);
  }

  function validate(): FormErrors {
    const found: FormErrors = {};
    if (!form.title.trim()) found.title = "Title is required";
    const credits = Number(form.credits);
    if (!form.credits) {
      found.credits = "Credits are required";
    } else if (!Number.isInteger(credits) || credits < 1) {
      found.credits = "Credits must be a whole number of 1 or more";
    }
    return found;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload: CourseRequest = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      credits: Number(form.credits),
      lecturerId: form.lecturerId ? Number(form.lecturerId) : null,
    };

    setSaving(true);
    try {
      if (editingId === null) {
        await courseService.create(payload);
        toast.success("Course added");
      } else {
        await courseService.update(editingId, payload);
        toast.success("Course updated");
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course: Course) {
    const ok = await confirm({
      title: "Delete course",
      message: `Delete "${course.title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    try {
      await courseService.remove(course.id);
      toast.success("Course deleted");
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const filtered = courses.filter((c) =>
    `${c.title} ${c.lecturer?.fullName ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Create courses and assign lecturers to them."
        action={
          <button onClick={openCreate} className={btnPrimary}>
            <Plus size={16} /> Add course
          </button>
        }
      />

      {loading ? (
        <Loading message="Loading courses..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : (
        <div className="space-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or lecturer..."
            aria-label="Search courses"
            className={`md:w-80 ${inputClass}`}
          />

          {filtered.length === 0 ? (
            courses.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No courses yet"
                description="Add your first course to get started."
                action={
                  <button onClick={openCreate} className={btnPrimary}>
                    Add course
                  </button>
                }
              />
            ) : (
              <EmptyState
                icon={Inbox}
                title="No courses match your search"
                description="Try a different title or lecturer name."
              />
            )
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Lecturer</th>
                    <th className="px-4 py-3">Credits</th>
                    <th className="px-4 py-3">Students</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{c.title}</p>
                        <p className="max-w-xs truncate text-slate-500">{c.description ?? ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        {c.lecturer ? (
                          c.lecturer.fullName
                        ) : (
                          <Badge tone="amber">Not assigned</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">{c.credits}</td>
                      <td className="px-4 py-3">{c.studentCount}</td>
                      <td className="space-x-2 px-4 py-3 text-right">
                        <button onClick={() => openEdit(c)} className={rowBtn}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(c)} className={rowBtnDanger}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editingId === null ? "Add a course" : "Edit course"}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Title" htmlFor="title" error={errors.title}>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              autoFocus
              className={inputClass}
            />
          </FormField>

          <FormField label="Credits" htmlFor="credits" error={errors.credits}>
            <input
              id="credits"
              name="credits"
              type="number"
              min="1"
              value={form.credits}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>

          <FormField label="Description" htmlFor="description" hint="Optional">
            <input
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Lecturer"
            htmlFor="lecturerId"
            hint="Optional. You can assign one later."
          >
            <select
              id="lecturerId"
              name="lecturerId"
              value={form.lecturerId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">No lecturer assigned</option>
              {lecturers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.fullName}
                </option>
              ))}
            </select>
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
              {saving ? "Saving..." : editingId === null ? "Add course" : "Save changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}