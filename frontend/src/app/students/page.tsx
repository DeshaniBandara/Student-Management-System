"use client";

import { useEffect, useState } from "react";
import type { Course, Student, StudentRequest } from "@/types";
import { studentService } from "@/services/studentService";
import { courseService } from "@/services/courseService";
import { getErrorMessage } from "@/lib/api";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  age: "",
  phone: "",
  courseId: "",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load students and courses together when the page opens
  useEffect(() => {
    let ignore = false;
    Promise.all([studentService.getAll(), courseService.getAll()])
      .then(([studentData, courseData]) => {
        if (ignore) return;
        setStudents(studentData);
        setCourses(courseData);
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
      const [studentData, courseData] = await Promise.all([
        studentService.getAll(),
        courseService.getAll(),
      ]);
      setStudents(studentData);
      setCourses(courseData);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
  }

  function handleEdit(student: Student) {
    setEditingId(student.id);
    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      age: student.age === null ? "" : String(student.age),
      phone: student.phone ?? "",
      courseId: student.course ? String(student.course.id) : "",
    });
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const payload: StudentRequest = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      age: form.age ? Number(form.age) : undefined,
      phone: form.phone.trim() || undefined,
    };

    try {
      // Step 1: create or update the student's own details
      const saved =
        editingId === null
          ? await studentService.create(payload)
          : await studentService.update(editingId, payload);

      // Step 2: only call the course endpoints if the course choice changed
      const wantedCourseId = form.courseId ? Number(form.courseId) : null;
      const currentCourseId = saved.course?.id ?? null;

      if (wantedCourseId !== currentCourseId) {
        if (wantedCourseId === null) {
          await studentService.removeCourse(saved.id);
        } else {
          await studentService.assignCourse(saved.id, wantedCourseId);
        }
      }

      resetForm();
      await reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(student: Student) {
    if (!window.confirm(`Delete ${student.firstName} ${student.lastName}?`)) return;
    try {
      await studentService.remove(student.id);
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const inputClass = "rounded border border-slate-300 px-3 py-2";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Students</h1>

      {/* Add / edit form */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">
          {editingId === null ? "Add a student" : "Edit student"}
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First name"
            required
            className={inputClass}
          />
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last name"
            required
            className={inputClass}
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className={inputClass}
          />
          <input
            name="age"
            type="number"
            min="1"
            max="120"
            value={form.age}
            onChange={handleChange}
            placeholder="Age (optional)"
            className={inputClass}
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone (optional)"
            className={inputClass}
          />
          <select
            name="courseId"
            value={form.courseId}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">No course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId === null ? "Add student" : "Save changes"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      {loading ? (
        <Loading message="Loading students..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : (
        <div className="space-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className={`w-full md:w-80 ${inputClass}`}
          />

          {filtered.length === 0 ? (
            <p className="rounded bg-white p-6 text-center text-slate-500 shadow">
              {students.length === 0
                ? "No students yet. Add the first one above."
                : "No students match your search."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg bg-white shadow">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
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
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-4 py-3 font-medium">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="px-4 py-3">{s.email}</td>
                      <td className="px-4 py-3">{s.age ?? "-"}</td>
                      <td className="px-4 py-3">{s.phone ?? "-"}</td>
                      <td className="px-4 py-3">
                        {s.course ? (
                          <span className="rounded bg-slate-100 px-2 py-1">
                            {s.course.title}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="space-x-2 px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(s)}
                          className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                        >
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
    </div>
  );
}