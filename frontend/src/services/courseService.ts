import { api } from "@/lib/api";
import type { Course, CourseRequest } from "@/types";

export const courseService = {
  getAll: async (): Promise<Course[]> => {
    const response = await api.get<Course[]>("/api/courses");
    return response.data;
  },

  create: async (data: CourseRequest): Promise<Course> => {
    const response = await api.post<Course>("/api/courses", data);
    return response.data;
  },

  update: async (id: number, data: CourseRequest): Promise<Course> => {
    const response = await api.put<Course>(`/api/courses/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/api/courses/${id}`);
  },
};