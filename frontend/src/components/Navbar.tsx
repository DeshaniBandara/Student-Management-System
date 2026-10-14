"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/students", label: "Students" },
  { href: "/courses", label: "Courses" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/login") return null;

  const linkClass = (href: string) =>
    `rounded px-3 py-2 text-sm font-medium ${
      pathname.startsWith(href)
        ? "bg-slate-700 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <nav className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-lg font-semibold">
          Student Management
        </Link>

        <button
          className="rounded border border-slate-600 px-3 py-1 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <ul className="hidden items-center gap-2 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={linkClass(l.href)}>
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/login" className={linkClass("/login")}>
              Login
            </Link>
          </li>
        </ul>
      </div>

      {open && (
        <ul className="space-y-1 border-t border-slate-700 px-4 py-3 md:hidden">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={`block ${linkClass(l.href)}`} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/login" className={`block ${linkClass("/login")}`} onClick={() => setOpen(false)}>
              Login
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}