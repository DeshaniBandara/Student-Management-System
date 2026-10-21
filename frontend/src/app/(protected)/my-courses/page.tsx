"use client";

import { useEffect, useState } from "react";
import { BookOpen, Users, Inbox } from "lucide-react";
import type { Course, Student } from "@/types";
import { lecturerService } from "@/services/lecturerService";
import { getErrorMessage } from "@/lib/api";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import PageHeader from "@/components/PageHeader";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [studentError, setStudentError] = useState<string | null>(null);

  // 1. Courses ටික ලෝඩ් කරගන්නවා
  useEffect(() => {
    async function loadCourses() {
      try {
        setLoadingCourses(true);
        const data = await lecturerService.getMyCourses();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0]);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingCourses(false);
      }
    }
    loadCourses();
  }, []);

  // 2. Course එකක් select කරද්දි ඒකේ ළමයි ලෝඩ් කරගන්නවා
  useEffect(() => {
    if (!selectedCourse) return;

    async function loadStudents() {
      try {
        setLoadingStudents(true);
        setStudentError(null); 
        
        // ✅ මෙතන තමයි වැරැද්ද තිබ්බේ. getCourseStudents නෙවෙයි, getMyCourseStudents වෙන්න ඕන.
        const data = await lecturerService.getMyCourseStudents(selectedCourse!.id); 
        setStudents(data);
      } catch (err) {
        setStudentError(getErrorMessage(err)); 
      } finally {
        setLoadingStudents(false);
      }
    }
    loadStudents();
  }, [selectedCourse]);

  if (loadingCourses) return <Loading message="Loading your courses..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description="The courses assigned to you. Select one to see its class list."
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses assigned"
          description="You have not been assigned to any courses yet."
        />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                  selectedCourse?.id === course.id
                    ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                }`}
              >
                <div className="mb-2 flex w-full items-start justify-between">
                  <span className="font-semibold text-slate-800">{course.title}</span>
                  <Badge>{course.courseCode}</Badge>
                </div>
                <div className="mt-4 flex w-full items-center justify-between text-xs font-medium text-slate-600">
                  <span>{course.credits} credits</span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {course.studentCount} students
                  </span>
                </div>
              </button>
            ))}
          </div>

          {selectedCourse && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  Class list: {selectedCourse.title}
                </h2>
              </div>

              <div className="p-4">
                {loadingStudents ? (
                  <div className="py-8">
                    <Loading message="Loading students..." />
                  </div>
                ) : studentError ? (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                    {studentError}
                  </div>
                ) : students.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="No students enrolled"
                    description="There are no students in this course yet."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">NIC</th>
                          <th className="px-4 py-3">Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.id} className="border-t border-slate-100">
                            <td className="px-4 py-3 font-medium">
                              {student.firstName} {student.lastName}
                            </td>
                            <td className="px-4 py-3">
  <a 
    href={`mailto:${student.email}`} 
    className="text-indigo-600 hover:text-indigo-800 hover:underline"
  >
    {student.email}
  </a>
</td>
                            <td className="px-4 py-3">{student.nic}</td>
                            <td className="px-4 py-3">{student.phone ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}