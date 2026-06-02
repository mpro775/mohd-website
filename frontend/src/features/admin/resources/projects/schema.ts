import { z } from "zod";

export const projectFormSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب ويجب ملؤه"),
  slug: z.string().optional().or(z.literal("")),
  category: z.string().min(1, "التصنيف مطلوب ويجب اختياره"),
  status: z.enum(["completed", "in-progress", "paused"]),
  shortDescription: z.string().min(1, "وصف المشروع القصير مطلوب"),
  detailedDescription: z.string().min(1, "الوصف التفصيلي مطلوب ويجب كتابته"),
  technologies: z.array(z.string()),
  coverImage: z.string().nullable().optional(),
  liveUrl: z.string().url("يجب إدخال رابط صالح Demo").or(z.string().length(0)).optional().nullable(),
  githubUrl: z.string().url("يجب إدخال رابط مستودع GitHub صالح").or(z.string().length(0)).optional().nullable(),
  isPublished: z.boolean(),
  featured: z.boolean(),
  caseStudy: z.string().optional().nullable().or(z.literal("")),
  problem: z.string().optional().nullable().or(z.literal("")),
  solution: z.string().optional().nullable().or(z.literal("")),
  results: z.string().optional().nullable().or(z.literal("")),
  role: z.string().optional().nullable().or(z.literal("")),
  seo: z.object({
    metaTitle: z.string().optional().nullable().or(z.literal("")),
    metaDescription: z.string().optional().nullable().or(z.literal("")),
    ogImage: z.string().optional().nullable().or(z.literal("")),
  }).optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
