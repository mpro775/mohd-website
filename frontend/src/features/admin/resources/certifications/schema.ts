import { z } from "zod";

export const certificationTypes = [
  "course",
  "specialization",
  "professional-certificate",
  "professional-certification",
  "license",
  "bootcamp",
  "workshop",
  "attendance",
  "diploma",
  "award",
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

export const certificationFormSchema = z
  .object({
    title: z.string().trim().min(2, "عنوان الشهادة مطلوب").max(160),
    slug: z.string().trim().max(180).regex(/^[\u0600-\u06ffa-z0-9]+(?:-[\u0600-\u06ffa-z0-9]+)*$/i, "الرابط الفريد غير صالح").optional().or(z.literal("")),
    type: z.enum(certificationTypes),
    issuer: z.string().trim().min(2, "الجهة المانحة مطلوبة").max(140),
    platform: z.string().trim().max(140).optional().or(z.literal("")),
    platformUrl: optionalUrl,
    description: z.string().max(4000).optional().or(z.literal("")),
    credentialId: z.string().trim().max(250).optional().or(z.literal("")),
    credentialUrl: optionalUrl,
    issuedAt: optionalDate,
    expiresAt: optionalDate,
    doesNotExpire: z.boolean(),
    imageMediaId: optionalMediaId,
    image: z.string().optional().nullable(),
    documentMediaId: optionalMediaId,
    document: z.string().optional().nullable(),
    issuerLogoMediaId: optionalMediaId,
    issuerLogo: z.string().optional().nullable(),
    skills: z.array(z.string().trim().min(1).max(80)).max(50),
    category: z.string().trim().max(100).optional().or(z.literal("")),
    language: z.string().trim().max(60).optional().or(z.literal("")),
    durationHours: optionalNumber,
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
    const duration = values.durationHours === "" || values.durationHours == null ? undefined : Number(values.durationHours);
    if (duration !== undefined && (!Number.isFinite(duration) || duration < 0 || duration > 100000)) {
      context.addIssue({ code: "custom", path: ["durationHours"], message: "المدة يجب أن تكون رقمًا موجبًا" });
    }
    const order = values.order === "" || values.order == null ? undefined : Number(values.order);
    if (order !== undefined && (!Number.isInteger(order) || order < 0)) {
      context.addIssue({ code: "custom", path: ["order"], message: "الترتيب يجب أن يكون عددًا صحيحًا موجبًا" });
    }
    if (!values.doesNotExpire && values.issuedAt && values.expiresAt && values.expiresAt < values.issuedAt) {
      context.addIssue({ code: "custom", path: ["expiresAt"], message: "تاريخ الانتهاء يجب ألا يسبق تاريخ الإصدار" });
    }
  });

export type CertificationFormValues = z.infer<typeof certificationFormSchema>;

function optional(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function buildCertificationPayload(values: CertificationFormValues) {
  const durationHours = values.durationHours === "" || values.durationHours == null ? undefined : Number(values.durationHours);
  const order = values.order === "" || values.order == null ? undefined : Number(values.order);
  return {
    title: values.title.trim(),
    slug: optional(values.slug),
    type: values.type,
    issuer: values.issuer.trim(),
    platform: optional(values.platform),
    platformUrl: optional(values.platformUrl),
    description: optional(values.description),
    credentialId: optional(values.credentialId),
    credentialUrl: optional(values.credentialUrl),
    issuedAt: optional(values.issuedAt) ?? null,
    expiresAt: values.doesNotExpire ? null : (optional(values.expiresAt) ?? null),
    doesNotExpire: values.doesNotExpire,
    imageMediaId: values.imageMediaId || null,
    documentMediaId: values.documentMediaId || null,
    issuerLogoMediaId: values.issuerLogoMediaId || null,
    skills: values.skills.reduce<string[]>((result, skill) => {
      const cleaned = skill.trim();
      if (cleaned && !result.some((item) => item.toLocaleLowerCase() === cleaned.toLocaleLowerCase())) result.push(cleaned);
      return result;
    }, []),
    category: optional(values.category),
    language: optional(values.language),
    durationHours: Number.isFinite(durationHours) ? durationHours : undefined,
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
