import { api } from "@/lib/api";
import type { LecturerRequest, User, Course, Student } from "@/types";

export const lecturerService = {
  // ----- Admin කොටස -----
  getAll: async (): Promise<User[]> => {
    try {
      const response = await api.get("/api/admin/lecturers");
      return response.data;
    } catch (error) {
      console.error("Error fetching lecturers:", error);
      throw error; // UI එකට error එක යවන්න ඕන
    }
  },

  create: async (data: LecturerRequest): Promise<User> => {
    try {
      const response = await api.post("/api/admin/lecturers", data);
      return response.data;
    } catch (error) {
      console.error("Error creating lecturer:", error);
      throw error;
    }
  },

  update: async (id: number, data: LecturerRequest): Promise<User> => {
    try {
      const response = await api.put(`/api/admin/lecturers/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating lecturer:", error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/admin/lecturers/${id}`);
    } catch (error) {
      console.error("Error deleting lecturer:", error);
      throw error;
    }
  },

  // ----- Lecturer කොටස -----
  
  getMyCourses: async (): Promise<Course[]> => {
    try {
      const response = await api.get("/api/lecturer/courses");
      return response.data;
    } catch (error) {
      // ✅ Console එකේ ඇත්ත Error එක පේන්න මේක දැම්මා
      console.error("Error fetching my courses:", error); 
      throw error; // ✅ මේක අනිවාර්යයි
    }
  },

  getMyCourseStudents: async (courseId: number): Promise<Student[]> => {
    try {
      const response = await api.get(`/api/lecturer/courses/${courseId}/students`);
      return response.data;
    } catch (error) {
      // ✅ මේකෙන් තමයි 403 Forbidden, 500 එහෙම ආවම Console එකට එන්නේ
      console.error(`Error fetching students for course ${courseId}:`, error);
      throw error;
    }
  },
};