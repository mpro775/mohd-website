import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getAccessToken } from "@/lib/auth/session";

export default async function LoginPage() {
  const token = await getAccessToken();
  if (token) redirect("/admin/dashboard");
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm />
    </main>
  );
}
