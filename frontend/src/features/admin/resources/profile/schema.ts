import { z } from "zod";

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
  ogImageMediaId: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional(),
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
  profileImageMediaId: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
  profileImageAlt: z.string().optional().nullable().or(z.literal("")),
  cvMediaId: z.string().nullable().optional(),
  cvFile: z.string().nullable().optional(),
  yearsOfExperience: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional(),
  availableForWork: z.boolean(),
  languages: z.array(languageSchema),
  certificates: z.array(certificateSchema),
  seo: seoSchema.optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
