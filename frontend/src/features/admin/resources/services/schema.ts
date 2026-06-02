import { z } from "zod";

export const serviceFormSchema = z.object({
  name: z.string().min(1, "اسم الخدمة مطلوب ويجب ملؤه"),
  slug: z.string().optional().or(z.literal("")),
  shortDescription: z.string().min(1, "وصف الخدمة القصير مطلوب"),
  detailedDescription: z.string().optional().or(z.literal("")),
  icon: z.string().nullable().optional(),
  startingPrice: z.number().min(0, "السعر المبدئي يجب أن يكون صفر أو أكثر").optional().nullable().or(z.literal("")),
  currency: z.string().default("USD"),
  price: z.string().optional().or(z.literal("")),
  duration: z.string().optional().or(z.literal("")),
  deliverables: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  ctaText: z.string().optional().or(z.literal("")),
  ctaUrl: z.string().url("يجب إدخال رابط CTA صالح").or(z.string().length(0)).optional().nullable().or(z.literal("")),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  seo: z.object({
    metaTitle: z.string().optional().or(z.literal("")),
    metaDescription: z.string().optional().or(z.literal("")),
    ogImage: z.string().optional().or(z.literal("")),
  }).optional(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
