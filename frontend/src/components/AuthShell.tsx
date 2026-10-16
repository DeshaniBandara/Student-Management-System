import { GraduationCap } from "lucide-react";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-900 bg-linear-to-br from-brand-900 via-brand-800 to-slate-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <GraduationCap size={22} />
          </div>
          <span className="text-lg font-semibold">Student Management System</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Everything your university needs, in one place.
          </h2>
          <ul className="mt-6 space-y-3 text-brand-100">
            <li>Admins manage students, lecturers and courses</li>
            <li>Lecturers see their courses and class lists</li>
            <li>Students see their course and their lecturer</li>
          </ul>
        </div>

        <p className="text-sm text-brand-200">© 2026 Gamage Recruiters (PVT) Ltd. All rights reserved.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}