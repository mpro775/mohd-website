import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAccessToken } from "@/lib/auth/session";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AdminShell>{children}</AdminShell>
      </ThemeProvider>
    </QueryProvider>
  );
}
