import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";

export const instant = false;

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AuthGuard>{children}</AuthGuard>
    </AppShell>
  );
}