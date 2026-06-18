import { z } from "zod";

export const tagFormSchema = z.object({
  name: z.string().min(2, "اسم الوسم يجب أن يكون حرفين على الأقل"),
  slug: z.string().optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type TagFormValues = z.infer<typeof tagFormSchema>;
