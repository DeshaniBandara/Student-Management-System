import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  href,
  icon: Icon,
}: {
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </Link>
  );
}