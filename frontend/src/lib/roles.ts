import type { Role } from "@/types";

export const homeFor = (role: Role): string => {
  switch (role) {
    case "ADMIN":
      return "/dashboard";
    case "LECTURER":
      return "/my-courses";
    default:
      return "/my-course";
  }
};

export const roleLabel: Record<Role, string> = {
  ADMIN: "Admin",
  LECTURER: "Lecturer",
  STUDENT: "Student",
};

export const roleBadgeClass: Record<Role, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  LECTURER: "bg-blue-100 text-blue-800",
  STUDENT: "bg-emerald-100 text-emerald-800",
};

export const linksByRole: Record<Role, { href: string; label: string }[]> = {
  ADMIN: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/students", label: "Students" },
    { href: "/lecturers", label: "Lecturers" },
    { href: "/courses", label: "Courses" },
  ],
  LECTURER: [{ href: "/my-courses", label: "My Courses" }],
  STUDENT: [{ href: "/my-course", label: "My Course" }],
};

// The single source of truth: which roles may open which routes
const routeAccess: { prefix: string; roles: Role[] }[] = [
  { prefix: "/dashboard", roles: ["ADMIN"] },
  { prefix: "/students", roles: ["ADMIN"] },
  { prefix: "/courses", roles: ["ADMIN"] },
  { prefix: "/lecturers", roles: ["ADMIN"] },
  { prefix: "/my-courses", roles: ["LECTURER"] },
  { prefix: "/my-course", roles: ["STUDENT"] },
];

// Returns the allowed roles for a path, or null if the route has no extra restriction
export function requiredRoles(pathname: string): Role[] | null {
  const match = routeAccess.find(
    (r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/")
  );
  return match ? match.roles : null;
}