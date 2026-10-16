"use client";

import { useEffect, useState } from "react";
import type { Course, Student } from "@/types";
import { lecturerService } from "@/services/lecturerService";
import { getErrorMessage } from "@/lib/api";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let ignore = false;
    lecturerService
      .getMyCourses()
      .then((data) => {
        if (!ignore) setCourses(data);
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

  async function openCourse(course: Course) {
    setSelected(course);
    setSearch("");
    setStudents([]);
    setStudentsError(null);
    setLoadingStudents(true);
    try {
      setStudents(await lecturerService.getCourseStudents(course.id));
    } catch (err) {
      setStudentsError(getErrorMessage(err));
    } finally {
      setLoadingStudents(false);
    }
  }

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading message="Loading your courses..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Courses</h1>
        <p className="text-slate-600">The courses assigned to you. Select one to see its class list.</p>
      </div>

      {courses.length === 0 ? (
        <p className="rounded bg-white p-6 text-center text-slate-500 shadow">
          No courses are assigned to you yet. Please contact the administrator.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => openCourse(c)}
              className={`rounded-lg bg-white p-5 text-left shadow transition hover:shadow-md ${
                selected?.id === c.id ? "ring-2 ring-slate-700" : ""
              }`}
            >
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {c.description ?? "No description"}
              </p>
              <div className="mt-3 flex justify-between text-sm text-slate-600">
                <span>{c.credits} credits</span>
                <span className="font-medium">{c.studentCount} students</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <section className="space-y-3 rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-semibold">Class list: {selected.title}</h2>

          {loadingStudents ? (
            <Loading message="Loading class list..." />
          ) : studentsError ? (
            <p className="text-red-600">{studentsError}</p>
          ) : students.length === 0 ? (
            <p className="text-slate-500">No students are enrolled in this course yet.</p>
          ) : (
            <>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded border border-slate-300 px-3 py-2 md:w-80"
              />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="px-4 py-3 font-medium">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="px-4 py-3">
                          <a href={`mailto:${s.email}`} className="text-blue-700 underline">
                            {s.email}
                          </a>
                        </td>
                        <td className="px-4 py-3">{s.phone ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}