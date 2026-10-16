"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Check, Info, Presentation, Users } from "lucide-react";
import type { Course, Student, User } from "@/types";
import { studentService } from "@/services/studentService";
import { courseService } from "@/services/courseService";
import { adminService } from "@/services/adminService";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/Avatar";
import Badge from "@/components/Badge";
import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";

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

  const attention = [
    {
      count: students.filter((s) => !s.course).length,
      text: "students are not enrolled in a course",
      href: "/students",
      action: "Review students",
    },
    {
      count: courses.filter((c) => !c.lecturer).length,
      text: "courses have no lecturer assigned",
      href: "/courses",
      action: "Assign lecturers",
    },
    {
      count: lecturers.filter((l) => !courses.some((c) => c.lecturer?.id === l.id)).length,
      text: "lecturers have no course yet",
      href: "/courses",
      action: "Assign courses",
    },
  ].filter((item) => item.count > 0);

  const perCourse = courses.map((c) => ({
    id: c.id,
    title: c.title,
    count: students.filter((s) => s.course?.id === c.id).length,
  }));
  const maxCount = Math.max(1, ...perCourse.map((c) => c.count));

  const recent = [...students].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.fullName.split(" ")[0] ?? ""}`}
        description="Here is an overview of your system."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Students" value={students.length} href="/students" icon={Users} />
        <StatCard label="Lecturers" value={lecturers.length} href="/lecturers" icon={Presentation} />
        <StatCard label="Courses" value={courses.length} href="/courses" icon={BookOpen} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Needs your attention</h2>
        {attention.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 text-emerald-800">
            <Check size={20} />
            <span>Everything is set up. Every student has a course and every course has a lecturer.</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {attention.map((item) => (
              <li
                key={item.text}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-amber-50 p-3"
              >
                <span className="flex items-center gap-2 text-amber-900">
                  <Info size={18} />
                  <span>
                    <strong>{item.count}</strong> {item.text}
                  </span>
                </span>
                <Link
                  href={item.href}
                  className="rounded-md border border-amber-300 bg-white px-3 py-1 text-sm font-medium text-amber-900 hover:bg-amber-100"
                >
                  {item.action}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Students per course</h2>
          {perCourse.length === 0 ? (
            <p className="text-sm text-slate-500">No courses yet.</p>
          ) : (
            <ul className="space-y-4">
              {perCourse.map((c) => (
                <li key={c.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{c.title}</span>
                    <span className="text-slate-500">{c.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-brand-600"
                      style={{ width: `${(c.count / maxCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Recently added students</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500">No students yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <Avatar name={`${s.firstName} ${s.lastName}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="truncate text-xs text-slate-500">{s.email}</p>
                  </div>
                  {s.course ? <Badge>{s.course.title}</Badge> : <Badge tone="amber">No course</Badge>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}