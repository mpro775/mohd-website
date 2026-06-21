import { z } from "zod";

export const postFormSchema = z.object({
  title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
  slug: z.string().optional().or(z.literal("")),
  summary: z.string().min(20, "يجب أن يكون الملخص القصير 20 حرفاً على الأقل"),
  excerpt: z.string().optional().nullable().or(z.literal("")),
  content: z.string().min(50, "محتوى المقال الكامل يجب أن يكون 50 حرفاً على الأقل"),
  category: z.string().optional().nullable().or(z.literal("")),
  tags: z.array(z.string()),
  status: z.enum(["draft", "published", "scheduled", "archived"]),
  featuredImageMediaId: z.string().nullable().optional(),
  featuredImage: z.string().nullable().optional(),
  coverImageMediaId: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  publishDate: z.string().optional().nullable().or(z.literal("")),
  scheduledAt: z.string().optional().nullable().or(z.literal("")),
  readTime: z.union([z.number().min(0), z.literal(""), z.null()]).optional(),
  isFeatured: z.boolean(),
  allowIndexing: z.boolean(),
  canonicalUrl: z.string().url("يجب إدخال رابط canonicalUrl صالح").or(z.string().length(0)).optional().nullable().or(z.literal("")),
  seo: z.object({
    metaTitle: z.string().optional().or(z.literal("")),
    metaDescription: z.string().optional().or(z.literal("")),
    ogImageMediaId: z.string().optional().nullable().or(z.literal("")),
    ogImage: z.string().optional().nullable().or(z.literal("")),
  }).optional(),
});

export type PostFormValues = z.infer<typeof postFormSchema>;
