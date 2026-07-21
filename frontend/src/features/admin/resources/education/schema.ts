import { z } from "zod";

export const educationDegreeTypes = [
  "high-school",
  "diploma",
  "associate",
  "bachelor",
  "master",
  "doctorate",
  "postgraduate",
  "professional-degree",
  "other",
] as const;

const httpUrl = z.url("الرابط غير صالح").refine(
  (value) => /^https?:\/\//i.test(value),
  "يجب أن يبدأ الرابط بـ http أو https",
);
const optionalUrl = z.union([z.literal(""), httpUrl]).optional().nullable();
const optionalDate = z.union([
  z.literal(""),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "صيغة التاريخ غير صحيحة"),
]).optional().nullable();
const optionalMediaId = z.union([
  z.literal(""),
  z.string().regex(/^[a-f\d]{24}$/i, "معرّف الوسائط غير صالح"),
]).optional().nullable();
const optionalNumber = z.union([z.number(), z.string(), z.null(), z.undefined()]);

export const educationFormSchema = z
  .object({
    institution: z.string().trim().min(2, "اسم المؤسسة مطلوب").max(180),
    slug: z.string().trim().max(180).regex(/^[\u0600-\u06ffa-z0-9]+(?:-[\u0600-\u06ffa-z0-9]+)*$/i, "الرابط الفريد غير صالح").optional().or(z.literal("")),
    degree: z.string().trim().min(2, "اسم الدرجة مطلوب").max(180),
    degreeType: z.enum(educationDegreeTypes),
    fieldOfStudy: z.string().trim().max(180).optional().or(z.literal("")),
    startDate: optionalDate,
    endDate: optionalDate,
    isCurrent: z.boolean(),
    grade: z.string().trim().max(100).optional().or(z.literal("")),
    description: z.string().max(5000).optional().or(z.literal("")),
    location: z.string().trim().max(180).optional().or(z.literal("")),
    institutionUrl: optionalUrl,
    institutionLogoMediaId: optionalMediaId,
    institutionLogo: z.string().optional().nullable(),
    coverImageMediaId: optionalMediaId,
    coverImage: z.string().optional().nullable(),
    certificateMediaId: optionalMediaId,
    certificate: z.string().optional().nullable(),
    achievements: z.array(z.string().trim().min(1).max(180)).max(50),
    isFeatured: z.boolean(),
    isPublished: z.boolean(),
    order: optionalNumber,
    seo: z.object({
      metaTitle: z.string().max(70).optional().or(z.literal("")),
      metaDescription: z.string().max(180).optional().or(z.literal("")),
      ogImageMediaId: optionalMediaId,
      ogImage: z.string().optional().nullable(),
    }),
  })
  .superRefine((values, context) => {
    const order = values.order === "" || values.order == null ? undefined : Number(values.order);
    if (order !== undefined && (!Number.isInteger(order) || order < 0)) {
      context.addIssue({ code: "custom", path: ["order"], message: "الترتيب يجب أن يكون عددًا صحيحًا موجبًا" });
    }
    if (!values.isCurrent && values.startDate && values.endDate && values.endDate < values.startDate) {
      context.addIssue({ code: "custom", path: ["endDate"], message: "تاريخ النهاية يجب ألا يسبق تاريخ البداية" });
    }
  });

export type EducationFormValues = z.infer<typeof educationFormSchema>;

function optional(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function buildEducationPayload(values: EducationFormValues) {
  const order = values.order === "" || values.order == null ? undefined : Number(values.order);
  return {
    institution: values.institution.trim(),
    slug: optional(values.slug),
    degree: values.degree.trim(),
    degreeType: values.degreeType,
    fieldOfStudy: optional(values.fieldOfStudy),
    startDate: optional(values.startDate) ?? null,
    endDate: values.isCurrent ? null : (optional(values.endDate) ?? null),
    isCurrent: values.isCurrent,
    grade: optional(values.grade),
    description: optional(values.description),
    location: optional(values.location),
    institutionUrl: optional(values.institutionUrl),
    institutionLogoMediaId: values.institutionLogoMediaId || null,
    coverImageMediaId: values.coverImageMediaId || null,
    certificateMediaId: values.certificateMediaId || null,
    achievements: values.achievements.reduce<string[]>((result, achievement) => {
      const cleaned = achievement.trim();
      if (cleaned && !result.some((item) => item.toLocaleLowerCase() === cleaned.toLocaleLowerCase())) result.push(cleaned);
      return result;
    }, []),
    isFeatured: values.isFeatured,
    isPublished: values.isPublished,
    order,
    seo: {
      metaTitle: optional(values.seo.metaTitle),
      metaDescription: optional(values.seo.metaDescription),
      ogImageMediaId: values.seo.ogImageMediaId || null,
    },
  };
}
