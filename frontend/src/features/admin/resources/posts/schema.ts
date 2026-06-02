import { z } from "zod";

export const postFormSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب ويجب ملؤه"),
  slug: z.string().optional().or(z.literal("")),
  summary: z.string().min(20, "يجب أن يكون الملخص القصير أكثر من 20 حرفاً"),
  excerpt: z.string().optional().nullable().or(z.literal("")),
  content: z.string().min(1, "محتوى المقال الكامل مطلوب"),
  category: z.string().min(1, "التصنيف مطلوب ويجب اختياره"),
  tags: z.array(z.string()),
  status: z.enum(["draft", "published", "scheduled", "archived"]),
  featuredImage: z.string().optional().nullable().or(z.literal("")),
  coverImage: z.string().optional().nullable().or(z.literal("")),
  publishDate: z.string().optional().nullable().or(z.literal("")),
  scheduledAt: z.string().optional().nullable().or(z.literal("")),
  readTime: z.number().min(0, "يجب أن يكون وقت القراءة 0 أو أكثر").optional().nullable().or(z.literal("")),
  isFeatured: z.boolean(),
  allowIndexing: z.boolean(),
  canonicalUrl: z.string().url("يجب إدخال رابط canonicalUrl صالح").or(z.string().length(0)).optional().nullable().or(z.literal("")),
  seo: z.object({
    metaTitle: z.string().optional().or(z.literal("")),
    metaDescription: z.string().optional().or(z.literal("")),
    ogImage: z.string().optional().or(z.literal("")),
  }).optional(),
});

export type PostFormValues = z.infer<typeof postFormSchema>;
