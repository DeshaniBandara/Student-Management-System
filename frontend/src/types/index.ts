export type Role = "ADMIN" | "LECTURER" | "STUDENT";

export interface User {
  id: number;
  fullName: string;
  email: string;
  nic: string | null;
  role: Role; 
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface Course {
  id: number;
  title: string;
  description: string | null;
  credits: number;
  lecturer: User | null;
  studentCount: number;
}

export interface CourseRequest {
  title: string;
  description?: string;
  credits: number;
  lecturerId?: number | null;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  nic: string | null;
  age: number | null;
  phone: string | null;
  course: Course | null;
  
}

export interface StudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  phone?: string;
  courseId?: number | null;
  nic?: string | null;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}
export interface LecturerRequest {
  fullName: string;
  email: string;
  nic: string;
  password?: string;
  confirmPassword?: string;
}

