export default function Loading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-slate-600">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      <span>{message}</span>
    </div>
  );
}