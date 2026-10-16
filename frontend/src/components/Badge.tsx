type Tone = "slate" | "green" | "amber" | "blue" | "purple";

const tones: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-700",
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  purple: "bg-purple-100 text-purple-800",
};

export default function Badge({
  tone = "slate",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}