import { z } from "zod";

export const socialLinkSchema = z.object({
  platform: z.string().min(1, "منصة التواصل الاجتماعي مطلوبة"),
  url: z.string().url("يجب إدخال رابط صحيح"),
});

export const languageSchema = z.object({
  name: z.string().min(1, "اسم اللغة مطلوب"),
  level: z.string().optional(),
});

export const certificateSchema = z.object({
  title: z.string().min(1, "عنوان الشهادة مطلوب"),
  issuer: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
});

export const seoSchema = z.object({
  metaTitle: z.string().max(80, "العنوان يجب ألا يتجاوز 80 حرفاً").optional().or(z.literal("")),
  metaDescription: z.string().max(200, "الوصف يجب ألا يتجاوز 200 حرفاً").optional().or(z.literal("")),
  ogImage: z.string().optional().or(z.literal("")),
});

export const profileFormSchema = z.object({
  fullName: z.string().min(3, "الاسم الكامل يجب أن يتكون من 3 أحرف على الأقل"),
  title: z.string().min(3, "المسمى الوظيفي يجب أن يتكون من 3 أحرف على الأقل"),
  headline: z.string().optional().or(z.literal("")),
  bio: z.string().min(10, "السيرة المختصرة يجب أن تكون 10 أحرف على الأقل"),
  about: z.string().optional().or(z.literal("")),
  email: z.string().email("يجب إدخال بريد إلكتروني صحيح"),
  phone: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  profileImage: z.string().nullable().optional(),
  cvFile: z.string().nullable().optional(),
  yearsOfExperience: z.number().min(0, "سنوات الخبرة يجب أن تكون رقم إيجابي").optional().or(z.literal("")),
  availableForWork: z.boolean(),
  socialLinks: z.array(socialLinkSchema),
  languages: z.array(languageSchema),
  certificates: z.array(certificateSchema),
  seo: seoSchema.optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
