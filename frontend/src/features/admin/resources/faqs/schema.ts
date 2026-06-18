import { z } from "zod";

export const faqFormSchema = z.object({
  question: z.string().min(3, "حقل السؤال يجب أن يكون 3 أحرف على الأقل"),
  answer: z.string().min(3, "حقل الإجابة يجب أن يكون 3 أحرف على الأقل"),
  category: z.string().optional().or(z.literal("")),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  seo: z.object({
    metaTitle: z.string().optional().or(z.literal("")),
    metaDescription: z.string().optional().or(z.literal("")),
    ogImage: z.string().optional().or(z.literal("")),
  }).optional(),
});

export type FaqFormValues = z.infer<typeof faqFormSchema>;
