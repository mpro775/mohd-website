import { z } from "zod";

export const tagFormSchema = z.object({
  name: z.string().min(1, "اسم الوسم مطلوب ويجب كتابته"),
  slug: z.string().optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type TagFormValues = z.infer<typeof tagFormSchema>;
