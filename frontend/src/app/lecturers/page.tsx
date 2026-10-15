"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types";
import { adminService } from "@/services/adminService";
import { getErrorMessage } from "@/lib/api";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";

const emptyForm = { fullName: "", email: "", password: "" };

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    adminService
      .getLecturers()
      .then((data) => {
        if (!ignore) setLecturers(data);
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
      setLecturers(await adminService.getLecturers());
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await adminService.createLecturer({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setForm(emptyForm);
      await reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(lecturer: User) {
    if (!window.confirm(`Delete lecturer "${lecturer.fullName}"?`)) return;
    try {
      await adminService.deleteLecturer(lecturer.id);
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const inputClass = "rounded border border-slate-300 px-3 py-2";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lecturers</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Add a lecturer</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full name"
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
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Temporary password (8+ chars, letter and number)"
            required
            className={inputClass}
          />
        </div>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add lecturer"}
        </button>
      </form>

      {loading ? (
        <Loading message="Loading lecturers..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : lecturers.length === 0 ? (
        <p className="rounded bg-white p-6 text-center text-slate-500 shadow">
          No lecturers yet. Add the first one above.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lecturers.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{l.fullName}</td>
                  <td className="px-4 py-3">{l.email}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(l)}
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