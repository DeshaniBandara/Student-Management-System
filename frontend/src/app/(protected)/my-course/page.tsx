"use client";

import { useEffect, useState } from "react";
import type { Student } from "@/types";
import { studentService } from "@/services/studentService";
import { getErrorMessage } from "@/lib/api";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";

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
      <h1 className="text-2xl font-bold">Welcome, {student.firstName}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg bg-white p-5 shadow">
          <h2 className="mb-3 text-lg font-semibold">My course</h2>
          {course ? (
            <div className="space-y-2">
              <p className="text-xl font-bold">{course.title}</p>
              <p className="text-slate-600">{course.description ?? "No description"}</p>
              <p className="text-sm text-slate-500">{course.credits} credits</p>
              <div className="mt-3 rounded bg-slate-50 p-3 text-sm">
                <p className="font-medium">Lecturer</p>
                {course.lecturer ? (
                  <p>
                    {course.lecturer.fullName} ·{" "}
                    <a href={`mailto:${course.lecturer.email}`} className="text-blue-700 underline">
                      {course.lecturer.email}
                    </a>
                  </p>
                ) : (
                  <p className="text-slate-500">Not assigned yet</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-500">
              You are not enrolled in a course yet. Please contact the administrator.
            </p>
          )}
        </section>

        <section className="rounded-lg bg-white p-5 shadow">
          <h2 className="mb-3 text-lg font-semibold">My details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Name</dt>
              <dd>
                {student.firstName} {student.lastName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Email</dt>
              <dd>{student.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Age</dt>
              <dd>{student.age ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Phone</dt>
              <dd>{student.phone ?? "-"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}