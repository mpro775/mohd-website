import { z } from "zod";

export const technologyFormSchema = z.object({
  name: z.string().min(2, "اسم التقنية يجب أن يكون حرفين على الأقل"),
  slug: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  iconMediaId: z.string().nullable().optional(),
  category: z.string().min(1, "المجموعة الرئيسية مطلوبة"),
  group: z.string().optional().or(z.literal("")),
  proficiencyLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  officialUrl: z.string().url("يجب إدخال رابط صالح").or(z.string().length(0)).optional().nullable().or(z.literal("")),
  yearsOfExperience: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional(),
  color: z.string().optional().or(z.literal("")),
  highlighted: z.boolean(),
  isPublished: z.boolean(),
});

export type TechnologyFormValues = z.infer<typeof technologyFormSchema>;
