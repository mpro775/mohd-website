import { z } from "zod";

export const linkFormSchema = z.object({
  title: z.string().min(1, "عنوان الرابط مطلوب ويجب ملؤه"),
  slug: z.string().optional().or(z.literal("")),
  url: z.string().url("يجب إدخال رابط URL صالح ومستوفي الشروط").min(1, "رابط URL مطلوب للوصول للموقع"),
  description: z.string().optional().or(z.literal("")),
  icon: z.string().nullable().optional(),
  platform: z.string().optional().or(z.literal("")),
  category: z.string().optional().or(z.literal("")),
  openInNewTab: z.boolean(),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
});

export type LinkFormValues = z.infer<typeof linkFormSchema>;
