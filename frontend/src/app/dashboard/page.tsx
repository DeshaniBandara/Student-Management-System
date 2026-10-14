"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Course, Student } from "@/types";
import { studentService } from "@/services/studentService";
import { courseService } from "@/services/courseService";
import { getErrorMessage } from "@/lib/api";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";

async function fetchData() {
  const [students, courses] = await Promise.all([
    studentService.getAll(),
    courseService.getAll(),
  ]);
  return { students, courses };
}

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  function handleRetry() {
    setLoading(true);
    setError(null);
    fetchData()
      .then((data) => {
        setStudents(data.students);
        setCourses(data.courses);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={handleRetry} />;

  const withoutCourse = students.filter((s) => !s.course).length;

  const perCourse = courses.map((c) => ({
    id: c.id,
    title: c.title,
    count: students.filter((s) => s.course?.id === c.id).length,
  }));
  const maxCount = Math.max(1, ...perCourse.map((c) => c.count));

  const recent = [...students].sort((a, b) => b.id - a.id).slice(0, 5);

  const stats = [
    { label: "Total students", value: students.length, href: "/students" },
    { label: "Total courses", value: courses.length, href: "/courses" },
    { label: "Students without a course", value: withoutCourse, href: "/students" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-lg bg-white p-5 shadow transition hover:shadow-md"
          >
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Students per course */}
        <section className="rounded-lg bg-white p-5 shadow">
          <h2 className="mb-4 text-lg font-semibold">Students per course</h2>
          {perCourse.length === 0 ? (
            <p className="text-slate-500">No courses yet.</p>
          ) : (
            <ul className="space-y-3">
              {perCourse.map((c) => (
                <li key={c.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{c.title}</span>
                    <span className="font-medium">{c.count}</span>
                  </div>
                  <div className="h-2 rounded bg-slate-100">
                    <div
                      className="h-2 rounded bg-slate-700"
                      style={{ width: `${(c.count / maxCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent students */}
        <section className="rounded-lg bg-white p-5 shadow">
          <h2 className="mb-4 text-lg font-semibold">Recently added students</h2>
          {recent.length === 0 ? (
            <p className="text-slate-500">No students yet.</p>
          ) : (
            <ul className="divide-y">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-slate-500">{s.email}</p>
                  </div>
                  <span className="text-slate-600">{s.course?.title ?? "No course"}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}