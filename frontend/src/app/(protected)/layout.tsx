import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

export const instant = false;

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <AuthGuard>{children}</AuthGuard>
      </main>
    </>
  );
}