"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { adminNav } from "@/config/nav";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-l border-border bg-card p-4">
        <Link href="/admin/dashboard" className="mb-6 block font-mono text-lg font-bold text-primary">Mohd CMS</Link>
        <nav className="grid gap-1">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href} className={cn("rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground", pathname === item.href && "bg-muted text-foreground")}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <header className="flex h-16 items-center justify-between border-b border-border px-4">
          <p className="text-sm text-muted-foreground">لوحة الإدارة</p>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">
            <LogOut className="h-4 w-4" /> خروج
          </button>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
