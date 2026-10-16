"use client";

import { useEffect, useState } from "react";
import type { Student } from "@/types";
import { studentService } from "@/services/studentService";
import { getErrorMessage } from "@/lib/api";
import Avatar from "@/components/Avatar";
import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import PageHeader from "@/components/PageHeader";

export default function MyCoursePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    studentService
      .getMe()
      .then((data) => {
        if (!ignore) setStudent(data);
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

  if (loading) return <Loading message="Loading your details..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!student) return null;

  const course = student.course;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${student.firstName}`}
        description="Your course, your lecturer and your details."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">My course</h2>
          {course ? (
            <div className="space-y-3">
              <p className="text-xl font-bold">{course.title}</p>
              <p className="text-slate-600">{course.description ?? "No description"}</p>
              <p className="text-sm text-slate-500">{course.credits} credits</p>

              <div className="mt-2 rounded-lg bg-slate-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Lecturer
                </p>
                {course.lecturer ? (
                  <div className="flex items-center gap-3">
                    <Avatar name={course.lecturer.fullName} />
                    <div className="min-w-0">
                      <p className="font-medium">{course.lecturer.fullName}</p>
                      <a
                        href={`mailto:${course.lecturer.email}`}
                        className="truncate text-sm text-brand-700 hover:underline"
                      >
                        {course.lecturer.email}
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Not assigned yet</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-500">
              You are not enrolled in a course yet. Please contact the administrator.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">My details</h2>
          <dl className="divide-y divide-slate-100 text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium">
                {student.firstName} {student.lastName}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-500">Email</dt>
              <dd>{student.email}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-500">Age</dt>
              <dd>{student.age ?? "-"}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-500">Phone</dt>
              <dd>{student.phone ?? "-"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}