import { z } from "zod";

export const projectFormSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب").min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
  slug: z.string().optional().or(z.literal("")),
  category: z.string().min(1, "التصنيف مطلوب"),
  status: z.enum(["completed", "in-progress", "paused"]),
  shortDescription: z.string().min(10, "الوصف القصير يجب أن يكون 10 أحرف على الأقل"),
  detailedDescription: z.string().min(20, "الوصف التفصيلي يجب أن يكون 20 حرفاً على الأقل"),
  technologySlugs: z.array(z.string()),
  coverImageMediaId: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  liveUrl: z.string().url("يجب إدخال رابط صالح Demo").or(z.string().length(0)).optional().nullable().or(z.literal("")),
  githubUrl: z.string().url("يجب إدخال رابط مستودع GitHub صالح").or(z.string().length(0)).optional().nullable().or(z.literal("")),
  isPublished: z.boolean(),
  featured: z.boolean(),
  clientName: z.string().optional().nullable().or(z.literal("")),
  startDate: z.string().optional().nullable().or(z.literal("")),
  endDate: z.string().optional().nullable().or(z.literal("")),
  completionDate: z.string().optional().nullable().or(z.literal("")),
  galleryMediaIds: z.array(z.string()).optional(),
  gallery: z.array(z.string()).optional(),
  caseStudy: z.string().optional().nullable().or(z.literal("")),
  problem: z.string().optional().nullable().or(z.literal("")),
  solution: z.string().optional().nullable().or(z.literal("")),
  results: z.string().optional().nullable().or(z.literal("")),
  role: z.string().optional().nullable().or(z.literal("")),
  seo: z.object({
    metaTitle: z.string().optional().nullable().or(z.literal("")),
    metaDescription: z.string().optional().nullable().or(z.literal("")),
    ogImageMediaId: z.string().optional().nullable().or(z.literal("")),
    ogImage: z.string().optional().nullable().or(z.literal("")),
  }).optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
