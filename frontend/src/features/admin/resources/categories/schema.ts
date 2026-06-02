import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "اسم التصنيف مطلوب ويجب كتابته"),
  slug: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
