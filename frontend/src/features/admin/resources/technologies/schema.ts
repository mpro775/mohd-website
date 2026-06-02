import { z } from "zod";

export const technologyFormSchema = z.object({
  name: z.string().min(1, "اسم التقنية مطلوب ويجب ملؤه"),
  slug: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  icon: z.string().nullable().optional(),
  category: z.string().min(1, "المجموعة الرئيسية مطلوبة"),
  group: z.string().optional().or(z.literal("")),
  proficiencyLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  officialUrl: z.string().url("يجب إدخال رابط صالح").or(z.string().length(0)).optional().nullable().or(z.literal("")),
  yearsOfExperience: z.number().min(0, "سنوات الخبرة يجب أن تكون صفر أو أكثر").optional().nullable().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  highlighted: z.boolean(),
  isPublished: z.boolean(),
});

export type TechnologyFormValues = z.infer<typeof technologyFormSchema>;
