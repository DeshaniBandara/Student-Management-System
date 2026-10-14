import { api } from "@/lib/api";
import type { Student, StudentRequest } from "@/types";

export const studentService = {
  getAll: async (): Promise<Student[]> => {
    const response = await api.get<Student[]>("/api/students");
    return response.data;
  },

  create: async (data: StudentRequest): Promise<Student> => {
    const response = await api.post<Student>("/api/students", data);
    return response.data;
  },

  update: async (id: number, data: StudentRequest): Promise<Student> => {
    const response = await api.put<Student>(`/api/students/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/api/students/${id}`);
  },

  assignCourse: async (studentId: number, courseId: number): Promise<Student> => {
    const response = await api.put<Student>(`/api/students/${studentId}/course/${courseId}`);
    return response.data;
  },

  removeCourse: async (studentId: number): Promise<Student> => {
    const response = await api.delete<Student>(`/api/students/${studentId}/course`);
    return response.data;
  },
};