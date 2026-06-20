"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/common/Button";

const schema = z.object({
  fullName: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد غير صحيح"),
  phone: z.string().optional(),
  subject: z.string().min(3, "الموضوع مطلوب"),
  projectType: z.string().optional(),
  budgetRange: z.string().optional(),
  startTime: z.string().optional(),
  projectUrl: z.string().optional(),
  preferredContact: z.string().optional(),
  message: z.string().min(10, "اكتب رسالة أوضح"),
});

type FormValues = z.infer<typeof schema>;

const fields = [
  { name: "fullName", label: "الاسم الكامل", type: "text", autoComplete: "name" },
  { name: "email", label: "البريد الإلكتروني", type: "email", autoComplete: "email" },
  { name: "phone", label: "الهاتف (اختياري)", type: "tel", autoComplete: "tel" },
  { name: "subject", label: "الموضوع", type: "text", autoComplete: "off" },
] as const;

const selects = [
  { name: "projectType", label: "نوع المشروع", options: ["SaaS", "Dashboard", "Full-stack", "API", "Frontend"] },
  { name: "budgetRange", label: "الميزانية التقريبية", options: ["أقل من 500$", "500$ - 1500$", "1500$ - 5000$", "حسب النطاق"] },
  { name: "startTime", label: "وقت البدء", options: ["هذا الأسبوع", "هذا الشهر", "خلال 3 أشهر", "غير محدد"] },
  { name: "preferredContact", label: "طريقة التواصل المفضلة", options: ["Email", "WhatsApp", "Call"] },
] as const;

export function ContactForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      projectType: "",
      budgetRange: "",
      startTime: "",
      projectUrl: "",
      preferredContact: "",
      message: "",
    },
  });

  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    const enrichedMessage = `
نوع المشروع: ${values.projectType || "غير محدد"}
الميزانية التقريبية: ${values.budgetRange || "غير محددة"}
وقت البدء: ${values.startTime || "غير محدد"}
رابط المشروع: ${values.projectUrl || "غير متوفر"}
طريقة التواصل المفضلة: ${values.preferredContact || "غير محددة"}

الرسالة:
${values.message}
`.trim();

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          subject: values.subject,
          message: enrichedMessage,
        }),
      });

      if (!response.ok) {
        toast.error("تعذر إرسال الرسالة. يرجى المحاولة مرة أخرى.");
        return;
      }

      toast.success("تم إرسال الرسالة بنجاح.");
      form.reset();
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="premium-card space-y-5 p-6 md:p-8">
      <div className="border-b border-border/40 pb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/25 bg-primary/10">
            <Send className="h-3.5 w-3.5 text-primary" />
          </span>
          نموذج استشارة مشروع
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">املأ التفاصيل المتاحة، وسأرتبها في رسالة واحدة واضحة.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => {
          const hasError = !!errors[field.name];
          return (
            <label key={field.name} className="block text-sm">
              <span className="mb-2 block font-medium text-muted-foreground">{field.label}</span>
              <input
                type={field.type}
                autoComplete={field.autoComplete}
                aria-invalid={hasError}
                disabled={isSubmitting}
                {...form.register(field.name)}
                className="input-glow h-11 w-full rounded-md border border-border bg-background px-3 outline-none transition disabled:opacity-50 aria-[invalid=true]:border-destructive/60"
              />
              {hasError ? <span className="mt-1.5 block text-xs text-destructive">{errors[field.name]?.message}</span> : null}
            </label>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {selects.map((field) => (
          <label key={field.name} className="block text-sm">
            <span className="mb-2 block font-medium text-muted-foreground">{field.label}</span>
            <select
              disabled={isSubmitting}
              {...form.register(field.name)}
              className="input-glow h-11 w-full rounded-md border border-border bg-background px-3 outline-none transition disabled:opacity-50"
            >
              <option value="">غير محدد</option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <label className="block text-sm">
        <span className="mb-2 block font-medium text-muted-foreground">رابط المشروع أو المرجع (اختياري)</span>
        <input
          type="url"
          disabled={isSubmitting}
          {...form.register("projectUrl")}
          className="input-glow h-11 w-full rounded-md border border-border bg-background px-3 outline-none transition disabled:opacity-50"
          dir="ltr"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-2 block font-medium text-muted-foreground">الرسالة</span>
        <textarea
          rows={6}
          aria-invalid={!!errors.message}
          disabled={isSubmitting}
          {...form.register("message")}
          className="input-glow w-full rounded-md border border-border bg-background p-3 outline-none transition disabled:opacity-50 aria-[invalid=true]:border-destructive/60"
        />
        {errors.message ? <span className="mt-1.5 block text-xs text-destructive">{errors.message.message}</span> : null}
      </label>

      <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
        {isSubmitting ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            جار الإرسال...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            إرسال الاستشارة
          </>
        )}
      </Button>
    </form>
  );
}
