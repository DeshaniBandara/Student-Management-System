"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { GraduationCap, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { linksByRole, roleBadgeClass, roleLabel } from "@/lib/roles";
import Avatar from "@/components/Avatar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = user ? linksByRole[user.role] : [];

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-200">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <GraduationCap size={20} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Student</p>
          <p className="text-xs text-slate-400">Management System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Main navigation">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-brand-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="border-t border-slate-100 hover:bg-slate-50 border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.fullName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
              <span
                className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${roleBadgeClass[user.role]}`}
              >
                {roleLabel[user.role]}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 w-64">{sidebar}</div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 shadow-xl">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-1.5 hover:bg-slate-100"
          >
            <Menu size={22} />
          </button>
          <span className="font-semibold">Student Management</span>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}