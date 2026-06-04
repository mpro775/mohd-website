"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/common/Button";

const schema = z.object({
  fullName: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد غير صحيح"),
  phone: z.string().optional(),
  subject: z.string().min(3, "الموضوع مطلوب"),
  message: z.string().min(10, "اكتب رسالة أوضح"),
});

type FormValues = z.infer<typeof schema>;

const fields = [
  { name: "fullName", label: "الاسم الكامل", type: "text", autoComplete: "name" },
  { name: "email", label: "البريد الإلكتروني", type: "email", autoComplete: "email" },
  { name: "phone", label: "الهاتف (اختياري)", type: "tel", autoComplete: "tel" },
  { name: "subject", label: "الموضوع", type: "text", autoComplete: "off" },
] as const;

export function ContactForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", phone: "", subject: "", message: "" }
  });

  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      
      if (!response.ok) {
        toast.error("تعذر إرسال الرسالة. يرجى المحاولة مرة أخرى.");
        return;
      }
      
      toast.success("تم إرسال الرسالة بنجاح!");
      form.reset();
    } catch {
      toast.error("حدث خطأ في الاتصال بالسيرفر.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-lg border border-border bg-card p-6 md:p-8 shadow-sm relative overflow-hidden">
      {/* Subtle decorative glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />
      
      <div className="relative border-b border-border/40 pb-4 mb-2">
        <h2 className="text-lg font-bold font-mono text-foreground flex items-center gap-2 justify-start">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/20 bg-primary/5">
            <Send className="h-3 w-3 text-primary" />
          </span>
          <span>{"// إرسال رسالة"}</span>
        </h2>
      </div>

      {fields.map((field) => {
        const hasError = !!errors[field.name];
        return (
          <label key={field.name} className="relative block text-sm">
            <span className="mb-2 block text-muted-foreground font-medium">{field.label}</span>
            <input
              type={field.type}
              autoComplete={field.autoComplete}
              aria-invalid={hasError}
              disabled={isSubmitting}
              {...form.register(field.name)}
              className="input-glow h-11 w-full rounded-md border border-border bg-background px-3 outline-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary/50 disabled:opacity-50 aria-[invalid=true]:border-destructive/60 aria-[invalid=true]:focus-visible:ring-destructive"
            />
            {hasError && (
              <span className="mt-1.5 block text-xs text-destructive font-medium">
                {errors[field.name]?.message}
              </span>
            )}
          </label>
        );
      })}

      <label className="relative block text-sm">
        <span className="mb-2 block text-muted-foreground font-medium">الرسالة</span>
        <textarea
          rows={6}
          aria-invalid={!!errors.message}
          disabled={isSubmitting}
          {...form.register("message")}
          className="input-glow w-full rounded-md border border-border bg-background p-3 outline-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary/50 disabled:opacity-50 aria-[invalid=true]:border-destructive/60 aria-[invalid=true]:focus-visible:ring-destructive"
        />
        {errors.message && (
          <span className="mt-1.5 block text-xs text-destructive font-medium">
            {errors.message.message}
          </span>
        )}
      </label>

      <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
        {isSubmitting ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            جارٍ الإرسال...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            إرسال الرسالة
          </>
        )}
      </Button>
    </form>
  );
}
