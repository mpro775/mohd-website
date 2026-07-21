import { describe, expect, it } from "vitest";
import { buildCertificationPayload, certificationFormSchema } from "./schema";

const valid = {
  title: "AWS Certified Solutions Architect",
  slug: "",
  type: "professional-certification" as const,
  issuer: "Amazon Web Services",
  platform: "",
  platformUrl: "",
  description: "",
  credentialId: "",
  credentialUrl: "https://example.com/verify",
  issuedAt: "2026-01-10",
  expiresAt: "2029-01-10",
  doesNotExpire: false,
  imageMediaId: null,
  image: null,
  documentMediaId: null,
  document: null,
  issuerLogoMediaId: null,
  issuerLogo: null,
  skills: ["AWS"],
  category: "",
  language: "",
  durationHours: 20,
  isFeatured: true,
  isPublished: true,
  order: 1,
  seo: { metaTitle: "", metaDescription: "", ogImageMediaId: null, ogImage: null },
};

describe("certificationFormSchema", () => {
  it("accepts valid data and nullable media fields", () => {
    expect(certificationFormSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["title", ""],
    ["issuer", ""],
    ["credentialUrl", "not-a-url"],
    ["platformUrl", "ftp://example.com"],
    ["durationHours", -1],
  ])("rejects invalid %s", (field, value) => {
    expect(certificationFormSchema.safeParse({ ...valid, [field]: value }).success).toBe(false);
  });

  it("rejects an expiry before the issue date", () => {
    expect(certificationFormSchema.safeParse({ ...valid, expiresAt: "2025-01-01" }).success).toBe(false);
  });

  it("allows no expiry and removes the expiry from the payload", () => {
    const parsed = certificationFormSchema.parse({ ...valid, doesNotExpire: true, expiresAt: "" });
    expect(buildCertificationPayload(parsed).expiresAt).toBeNull();
  });

  it("rejects more than 50 skills", () => {
    expect(certificationFormSchema.safeParse({ ...valid, skills: Array.from({ length: 51 }, (_, index) => `Skill ${index}`) }).success).toBe(false);
  });

  it("deduplicates skills case-insensitively in the payload", () => {
    const parsed = certificationFormSchema.parse({ ...valid, skills: ["AWS", "aws"] });
    expect(buildCertificationPayload(parsed).skills).toEqual(["AWS"]);
  });
});
