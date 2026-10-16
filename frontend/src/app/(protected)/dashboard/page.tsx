"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Course, Student, User } from "@/types";
import { studentService } from "@/services/studentService";
import { courseService } from "@/services/courseService";
import { adminService } from "@/services/adminService";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";

async function fetchData() {
  const [students, courses, lecturers] = await Promise.all([
    studentService.getAll(),
    courseService.getAll(),
    adminService.getLecturers(),
  ]);
  return { students, courses, lecturers };
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchData()
      .then((data) => {
        if (ignore) return;
        setStudents(data.students);
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

  function handleRetry() {
    setLoading(true);
    setError(null);
    fetchData()
      .then((data) => {
        setStudents(data.students);
        setCourses(data.courses);
        setLecturers(data.lecturers);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={handleRetry} />;

  const studentsWithoutCourse = students.filter((s) => !s.course).length;
  const coursesWithoutLecturer = courses.filter((c) => !c.lecturer).length;
  const lecturersWithoutCourse = lecturers.filter(
    (l) => !courses.some((c) => c.lecturer?.id === l.id)
  ).length;

  const attention = [
    {
      count: studentsWithoutCourse,
      text: "students are not enrolled in a course",
      href: "/students",
      action: "Review students",
    },
    {
      count: coursesWithoutLecturer,
      text: "courses have no lecturer assigned",
      href: "/courses",
      action: "Assign lecturers",
    },
    {
      count: lecturersWithoutCourse,
      text: "lecturers have no course yet",
      href: "/courses",
      action: "Assign courses",
    },
  ].filter((item) => item.count > 0);

  const stats = [
    { label: "Students", value: students.length, href: "/students" },
    { label: "Lecturers", value: lecturers.length, href: "/lecturers" },
    { label: "Courses", value: courses.length, href: "/courses" },
  ];

  const perCourse = courses.map((c) => ({
    id: c.id,
    title: c.title,
    count: students.filter((s) => s.course?.id === c.id).length,
  }));
  const maxCount = Math.max(1, ...perCourse.map((c) => c.count));

  const recent = [...students].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.fullName}</h1>
        <p className="text-slate-600">Here is an overview of your system.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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

      <section className="rounded-lg bg-white p-5 shadow">
        <h2 className="mb-3 text-lg font-semibold">Needs your attention</h2>
        {attention.length === 0 ? (
          <p className="rounded bg-emerald-50 p-3 text-emerald-800">
            Everything is set up. Every student has a course and every course has a lecturer.
          </p>
        ) : (
          <ul className="space-y-2">
            {attention.map((item) => (
              <li
                key={item.text}
                className="flex flex-wrap items-center justify-between gap-2 rounded bg-amber-50 p-3"
              >
                <span className="text-amber-900">
                  <strong>{item.count}</strong> {item.text}
                </span>
                <Link
                  href={item.href}
                  className="rounded border border-amber-300 px-3 py-1 text-sm font-medium text-amber-900 hover:bg-amber-100"
                >
                  {item.action}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
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