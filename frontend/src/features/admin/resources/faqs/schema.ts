import { z } from "zod";

export const faqFormSchema = z.object({
  question: z.string().min(1, "حقل السؤال مطلوب ويجب كتابته بالتفصيل"),
  answer: z.string().min(1, "حقل الإجابة مطلوب لتوضيح السؤال للعملاء والمستخدمين"),
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
