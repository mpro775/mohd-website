"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";

const schema = z.object({
  email: z.string().email("البريد غير صحيح"),
  password: z.string().min(6, "كلمة المرور قصيرة"),
});

type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: Values) {
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    if (!response.ok) {
      toast.error("فشل تسجيل الدخول");
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6">
      <div>
        <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
        <p className="mt-2 text-sm text-muted-foreground">لوحة إدارة المحتوى التقني.</p>
      </div>
      <label className="block text-sm">
        <span className="mb-2 block text-muted-foreground">البريد الإلكتروني</span>
        <input {...form.register("email")} className="h-11 w-full rounded-md border border-border bg-background px-3 outline-none focus:border-primary" />
        <span className="text-xs text-red-300">{form.formState.errors.email?.message}</span>
      </label>
      <label className="block text-sm">
        <span className="mb-2 block text-muted-foreground">كلمة المرور</span>
        <input type="password" {...form.register("password")} className="h-11 w-full rounded-md border border-border bg-background px-3 outline-none focus:border-primary" />
        <span className="text-xs text-red-300">{form.formState.errors.password?.message}</span>
      </label>
      <Button disabled={form.formState.isSubmitting} className="w-full">دخول</Button>
    </form>
  );
}
