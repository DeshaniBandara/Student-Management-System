

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";

export const instant = { unstable_disableValidation: true };

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AuthGuard>{children}</AuthGuard>
    </AppShell>
  );
}