import AuthGuard from "@/components/AuthGuard";

export const instant = false;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthGuard roles={["LECTURER"]}>{children}</AuthGuard>;
}