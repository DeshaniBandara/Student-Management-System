export interface Course {
  id: number;
  title: string;
  description: string | null;
  credits: number;
}

export interface CourseRequest {
  title: string;
  description?: string;
  credits: number;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
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
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}