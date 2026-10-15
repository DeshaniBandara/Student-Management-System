import AuthGuard from "@/components/AuthGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthGuard roles={["ADMIN"]}>{children}</AuthGuard>;
}