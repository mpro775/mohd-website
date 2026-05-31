"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";

const schema = z.object({
  fullName: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد غير صحيح"),
  phone: z.string().optional(),
  subject: z.string().min(3, "الموضوع مطلوب"),
  message: z.string().min(10, "اكتب رسالة أوضح"),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { fullName: "", email: "", phone: "", subject: "", message: "" } });

  async function onSubmit(values: FormValues) {
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    if (!response.ok) {
      toast.error("تعذر إرسال الرسالة");
      return;
    }
    toast.success("تم إرسال الرسالة");
    form.reset();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-border bg-card p-6">
      {[
        ["fullName", "الاسم الكامل"],
        ["email", "البريد الإلكتروني"],
        ["phone", "الهاتف اختياري"],
        ["subject", "الموضوع"],
      ].map(([name, label]) => (
        <label key={name} className="block text-sm">
          <span className="mb-2 block text-muted-foreground">{label}</span>
          <input {...form.register(name as keyof FormValues)} className="h-11 w-full rounded-md border border-border bg-background px-3 outline-none focus:border-primary" />
          <span className="mt-1 block text-xs text-red-300">{form.formState.errors[name as keyof FormValues]?.message}</span>
        </label>
      ))}
      <label className="block text-sm">
        <span className="mb-2 block text-muted-foreground">الرسالة</span>
        <textarea {...form.register("message")} rows={6} className="w-full rounded-md border border-border bg-background p-3 outline-none focus:border-primary" />
        <span className="mt-1 block text-xs text-red-300">{form.formState.errors.message?.message}</span>
      </label>
      <Button disabled={form.formState.isSubmitting} className="w-full">إرسال</Button>
    </form>
  );
}
