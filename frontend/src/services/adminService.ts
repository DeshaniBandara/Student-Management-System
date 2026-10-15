import { api } from "@/lib/api";
import type { RegisterRequest, User } from "@/types";

export const adminService = {
  getLecturers: async (): Promise<User[]> => {
    const response = await api.get<User[]>("/api/admin/lecturers");
    return response.data;
  },

  createLecturer: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>("/api/admin/lecturers", data);
    return response.data;
  },

  deleteLecturer: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/lecturers/${id}`);
  },
};