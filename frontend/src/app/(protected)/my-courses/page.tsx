"use client";

import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import type { Course, Student } from "@/types";
import { lecturerService } from "@/services/lecturerService";
import { getErrorMessage } from "@/lib/api";
import { inputClass } from "@/lib/ui";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import PageHeader from "@/components/PageHeader";

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
      <PageHeader
        title="My Courses"
        description="The courses assigned to you. Select one to see its class list."
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No courses assigned yet"
          description="Please contact the administrator to be assigned to a course."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => openCourse(c)}
              className={`rounded-xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
                selected?.id === c.id
                  ? "border-brand-600 ring-2 ring-brand-600/30"
                  : "border-slate-200"
              }`}
            >
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {c.description ?? "No description"}
              </p>
              <div className="mt-4 flex justify-between text-sm text-slate-600">
                <span>{c.credits} credits</span>
                <span className="font-medium">{c.studentCount} students</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Class list: {selected.title}</h2>

          {loadingStudents ? (
            <Loading message="Loading class list..." />
          ) : studentsError ? (
            <p className="text-red-600">{studentsError}</p>
          ) : students.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No students enrolled yet"
              description="Students appear here once the administrator enrolls them."
            />
          ) : (
            <>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                aria-label="Search class list"
                className={`md:w-80 ${inputClass}`}
              />
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={`${s.firstName} ${s.lastName}`} />
                            <span className="font-medium">
                              {s.firstName} {s.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`mailto:${s.email}`}
                            className="text-brand-700 hover:underline"
                          >
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