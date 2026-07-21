import { z } from "zod";

export const postEditorSchema = z.object({
  title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل").max(180),
  slug: z.string().max(200).optional().or(z.literal("")),
  summary: z.string().min(20, "الملخص يجب أن يكون 20 حرفًا على الأقل").max(500),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  content: z.string().min(1, "المحتوى مطلوب").max(500_000),
  category: z.string().min(1, "التصنيف مطلوب"),
  tags: z.array(z.string()),
  relatedPostIds: z.array(z.string()),
  featuredImageMediaId: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  coverImageMediaId: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  isFeatured: z.boolean(),
  featuredOrder: z.number().int().min(0).optional(),
  allowIndexing: z.boolean(),
  canonicalUrl: z.string().url("الرابط الأساسي غير صالح").optional().or(z.literal("")),
  seo: z.object({
    metaTitle: z.string().max(70).optional().or(z.literal("")),
    metaDescription: z.string().max(180).optional().or(z.literal("")),
    ogImageMediaId: z.string().optional().nullable(),
    ogImage: z.string().optional().nullable(),
  }),
});

export type PostEditorValues = z.infer<typeof postEditorSchema>;

export const EMPTY_POST_VALUES: PostEditorValues = {
  title: "",
  slug: "",
  summary: "",
  excerpt: "",
  content: "",
  category: "",
  tags: [],
  relatedPostIds: [],
  featuredImageMediaId: null,
  featuredImage: null,
  coverImageMediaId: null,
  coverImage: null,
  isFeatured: false,
  featuredOrder: 0,
  allowIndexing: true,
  canonicalUrl: "",
  seo: { metaTitle: "", metaDescription: "", ogImageMediaId: null, ogImage: null },
};
