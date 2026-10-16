"use client";

import { useEffect, useState } from "react";
import type { Course, CourseRequest, User } from "@/types";
import { courseService } from "@/services/courseService";
import { adminService } from "@/services/adminService";
import { getErrorMessage } from "@/lib/api";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";

const emptyForm = { title: "", description: "", credits: "", lecturerId: "" };

async function fetchData() {
  const [courses, lecturers] = await Promise.all([
    courseService.getAll(),
    adminService.getLecturers(),
  ]);
  return { courses, lecturers };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  function handleEdit(course: Course) {
    setEditingId(course.id);
    setForm({
      title: course.title,
      description: course.description ?? "",
      credits: String(course.credits),
      lecturerId: course.lecturer ? String(course.lecturer.id) : "",
    });
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const payload: CourseRequest = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      credits: Number(form.credits),
      lecturerId: form.lecturerId ? Number(form.lecturerId) : null,
    };

    try {
      if (editingId === null) {
        await courseService.create(payload);
      } else {
        await courseService.update(editingId, payload);
      }
      resetForm();
      await reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course: Course) {
    if (!window.confirm(`Delete "${course.title}"?`)) return;
    try {
      await courseService.remove(course.id);
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const inputClass = "rounded border border-slate-300 px-3 py-2";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Courses</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">
          {editingId === null ? "Add a course" : "Edit course"}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            required
            className={inputClass}
          />
          <input
            name="credits"
            type="number"
            min="1"
            value={form.credits}
            onChange={handleChange}
            placeholder="Credits"
            required
            className={inputClass}
          />
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description (optional)"
            className={inputClass}
          />
          <select
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
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId === null ? "Add course" : "Save changes"}
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

      {loading ? (
        <Loading message="Loading courses..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : courses.length === 0 ? (
        <p className="rounded bg-white p-6 text-center text-slate-500 shadow">
          No courses yet. Add the first one above.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Lecturer</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3">Students</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-t">
                  <td className="px-4 py-3">
                    <p className="font-medium">{course.title}</p>
                    <p className="text-slate-500">{course.description ?? ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    {course.lecturer ? (
                      course.lecturer.fullName
                    ) : (
                      <span className="rounded bg-amber-100 px-2 py-1 text-amber-800">
                        Not assigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{course.credits}</td>
                  <td className="px-4 py-3">{course.studentCount}</td>
                  <td className="space-x-2 px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(course)}
                      className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course)}
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
  );
}