"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { homeFor, linksByRole, roleBadgeClass, roleLabel } from "@/lib/roles";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (pathname === "/login" || pathname === "/register") return null;

  const links = user ? linksByRole[user.role] : [];

  function handleLogout() {
    logout();
    setOpen(false);
    router.replace("/login");
  }

  const linkClass = (href: string) =>
    `rounded px-3 py-2 text-sm font-medium ${
      pathname.startsWith(href)
        ? "bg-slate-700 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <nav className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={user ? homeFor(user.role) : "/login"} className="text-lg font-semibold">
          Student Management
        </Link>

        <button
          className="rounded border border-slate-600 px-3 py-1 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div className="hidden items-center gap-2 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}

          {!loading && user && (
            <div className="ml-4 flex items-center gap-3 border-l border-slate-700 pl-4">
              <div className="text-right text-sm leading-tight">
                <p className="font-medium">{user.fullName}</p>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${roleBadgeClass[user.role]}`}
                >
                  {roleLabel[user.role]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded border border-slate-600 px-3 py-1 text-sm hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          )}

          {!loading && !user && (
            <Link href="/login" className={linkClass("/login")}>
              Login
            </Link>
          )}
        </div>
      </div>

      {open && (
        <div className="space-y-1 border-t border-slate-700 px-4 py-3 md:hidden">
          {user && (
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">{user.fullName}</span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-semibold ${roleBadgeClass[user.role]}`}
              >
                {roleLabel[user.role]}
              </span>
            </div>
          )}
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block ${linkClass(l.href)}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="mt-2 w-full rounded border border-slate-600 px-3 py-2 text-left text-sm hover:bg-slate-800"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className={`block ${linkClass("/login")}`} onClick={() => setOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}