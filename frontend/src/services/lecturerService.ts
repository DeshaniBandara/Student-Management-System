import { api } from "@/lib/api"; //  api setup (Axios/Fetch)
import type { LecturerRequest, User } from "@/types";

export const lecturerService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get("/api/admin/lecturers");
    return response.data;
  },

  create: async (data: LecturerRequest): Promise<User> => {
    const response = await api.post("/api/admin/lecturers", data);
    return response.data;
  },

  update: async (id: number, data: LecturerRequest): Promise<User> => {
    const response = await api.put(`/api/admin/lecturers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/lecturers/${id}`);
  },
};