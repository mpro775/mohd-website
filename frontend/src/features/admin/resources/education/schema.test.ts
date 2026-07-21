import { describe, expect, it } from "vitest";
import { buildEducationPayload, educationFormSchema } from "./schema";

const valid = {
  institution: "جامعة مثال",
  slug: "",
  degree: "بكالوريوس علوم الحاسوب",
  degreeType: "bachelor" as const,
  fieldOfStudy: "علوم الحاسوب",
  startDate: "2019-09-01",
  endDate: "2023-06-30",
  isCurrent: false,
  grade: "جيد جداً",
  description: "",
  location: "الرياض",
  institutionUrl: "https://example.edu",
  institutionLogoMediaId: null,
  institutionLogo: null,
  coverImageMediaId: null,
  coverImage: null,
  certificateMediaId: null,
  certificate: null,
  achievements: ["مشروع تخرج"],
  isFeatured: true,
  isPublished: true,
  order: 1,
  seo: { metaTitle: "", metaDescription: "", ogImageMediaId: null, ogImage: null },
};

describe("educationFormSchema", () => {
  it("accepts valid education data", () => {
    expect(educationFormSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["institution", ""],
    ["degree", ""],
    ["institutionUrl", "invalid"],
  ])("rejects invalid %s", (field, value) => {
    expect(educationFormSchema.safeParse({ ...valid, [field]: value }).success).toBe(false);
  });

  it("rejects an end date before the start date", () => {
    expect(educationFormSchema.safeParse({ ...valid, endDate: "2018-01-01" }).success).toBe(false);
  });

  it("allows current education without an end date and clears it in the payload", () => {
    const parsed = educationFormSchema.parse({ ...valid, isCurrent: true, endDate: "" });
    expect(buildEducationPayload(parsed).endDate).toBeNull();
  });

  it("rejects more than 50 achievements", () => {
    expect(educationFormSchema.safeParse({ ...valid, achievements: Array.from({ length: 51 }, (_, index) => `Achievement ${index}`) }).success).toBe(false);
  });
});
