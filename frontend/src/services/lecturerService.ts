import { api } from "@/lib/api";
import type { Course, Student } from "@/types";

export const lecturerService = {
  getMyCourses: async (): Promise<Course[]> => {
    const response = await api.get<Course[]>("/api/lecturer/courses");
    return response.data;
  },

  getCourseStudents: async (courseId: number): Promise<Student[]> => {
    const response = await api.get<Student[]>(`/api/lecturer/courses/${courseId}/students`);
    return response.data;
  },
};