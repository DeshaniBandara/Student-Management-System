"use client";

import { useEffect, useState } from "react";
import { Inbox, Plus } from "lucide-react";
import type { Course, Student, StudentRequest } from "@/types";
import { studentService } from "@/services/studentService";
import { courseService } from "@/services/courseService";
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

const PAGE_SIZE = 10;

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  age: "",
  phone: "",
  courseId: "",
};

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: string;
  phone?: string;
}

async function fetchData() {
  const [students, courses] = await Promise.all([
    studentService.getAll(),
    courseService.getAll(),
  ]);
  return { students, courses };
}

export default function StudentsPage() {
  const toast = useToast();
  const { confirm } = useConfirm();

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [page, setPage] = useState(1);

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
        setStudents(data.students);
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
      setStudents(data.students);
      setCourses(data.courses);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setErrors({});
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(student: Student) {
    setEditingId(student.id);
    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      age: student.age === null ? "" : String(student.age),
      phone: student.phone ?? "",
      courseId: student.course ? String(student.course.id) : "",
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
    if (!form.firstName.trim()) found.firstName = "First name is required";
    if (!form.lastName.trim()) found.lastName = "Last name is required";

    if (!form.email.trim()) {
      found.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      found.email = "Enter a valid email address";
    }

    if (form.age) {
      const age = Number(form.age);
      if (!Number.isInteger(age) || age < 18 || age > 50) {
        found.age = "Age must be between 18 and 50";
      }
    }

    if (form.phone.trim() && !/^(?:\+94|0)[0-9]{9}$/.test(form.phone.trim())) {
      found.phone = "Enter a valid phone number (e.g., +94771234567 or 0771234567)";
    }
    return found;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload: StudentRequest = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      age: form.age ? Number(form.age) : undefined,
      phone: form.phone.trim() || undefined,
      courseId: form.courseId ? Number(form.courseId) : undefined,
    };

    // 🔍 DEBUG — remove these once the bug is fixed
    console.log("👉 CURRENT form:", form);
    console.log("👉 PAYLOAD:", payload);

    setSaving(true);
    try {
      if (editingId === null) {
        await studentService.create(payload);
        toast.success("Student added");
      } else {
        await studentService.update(editingId, payload);
        toast.success("Student updated");
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(student: Student) {
    const ok = await confirm({
      title: "Delete student",
      message: `Delete ${student.firstName} ${student.lastName}? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    try {
      await studentService.remove(student.id);
      toast.success("Student deleted");
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const filtered = students.filter((s) => {
    const matchesSearch = `${s.firstName} ${s.lastName} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCourse =
      courseFilter === "" ||
      (courseFilter === "none" ? !s.course : s.course?.id === Number(courseFilter));
    return matchesSearch && matchesCourse;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage student records and their courses."
        action={
          <button onClick={openCreate} className={btnPrimary}>
            <Plus size={16} /> Add student
          </button>
        }
      />

      {loading ? (
        <Loading message="Loading students..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email..."
              aria-label="Search students"
              className={`md:w-80 ${inputClass}`}
            />
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by course"
              className={`md:w-64 ${inputClass}`}
            >
              <option value="">All courses</option>
              <option value="none">No course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            students.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No students yet"
                description="Add your first student to get started."
                action={
                  <button onClick={openCreate} className={btnPrimary}>
                    Add student
                  </button>
                }
              />
            ) : (
              <EmptyState
                icon={Inbox}
                title="No students match your filters"
                description="Try a different name, email or course."
              />
            )
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Age</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((s) => (
                      <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="px-4 py-3">{s.email}</td>
                        <td className="px-4 py-3">{s.age ?? "-"}</td>
                        <td className="px-4 py-3">{s.phone ?? "-"}</td>
                        <td className="px-4 py-3">
                          {s.course ? (
                            <Badge>{s.course.title}</Badge>
                          ) : (
                            <Badge tone="amber">No course</Badge>
                          )}
                        </td>
                        <td className="space-x-2 px-4 py-3 text-right">
                          <button onClick={() => openEdit(s)} className={rowBtn}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(s)} className={rowBtnDanger}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                <span>
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={btnSecondary}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={btnSecondary}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editingId === null ? "Add a student" : "Edit student"}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First name" htmlFor="firstName" error={errors.firstName}>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                autoFocus
                className={inputClass}
              />
            </FormField>
            <FormField label="Last name" htmlFor="lastName" error={errors.lastName}>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className={inputClass}
              />
            </FormField>
          </div>

          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email}
            hint="The student registers with this email to see their own page."
          >
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Age" htmlFor="age" error={errors.age} hint="Optional">
              <input
                id="age"
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                className={inputClass}
              />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={errors.phone} hint="Optional">
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
            </FormField>
          </div>

          <FormField
            label="Course"
            htmlFor="courseId"
            hint="Optional. You can assign one later."
          >
            <select
              id="courseId"
              name="courseId"
              value={form.courseId}
              onChange={(e) => {
                console.log("🎯 DROPDOWN CHANGED →", e.target.value);
                handleChange(e);
              }}
              className={inputClass}
            >
              <option value="">No course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
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
              {saving ? "Saving..." : editingId === null ? "Add student" : "Save changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}