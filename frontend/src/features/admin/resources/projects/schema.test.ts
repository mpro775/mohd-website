import { describe, it, expect } from "vitest";
import { projectFormSchema } from "./schema";

describe("projectFormSchema tests", () => {
  const validData = {
    title: "مشروع جديد",
    slug: "new-project",
    category: "web-development",
    status: "completed" as const,
    shortDescription: "الوصف القصير للمشروع التجريبي.",
    detailedDescription: "هذا هو الوصف التفصيلي الكامل للمشروع التجريبي الذي يتجاوز الحد الأدنى.",
    technologies: ["React", "TailwindCSS"],
    coverImage: "https://example.com/image.jpg",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/test/repo",
    isPublished: true,
    featured: false,
    caseStudy: "",
    problem: "",
    solution: "",
    results: "",
    role: "",
    seo: {
      metaTitle: "سيو العنوان",
      metaDescription: "وصف السيو المناسب للمشروع",
      ogImage: "",
    },
  };

  it("should validate a completely correct form data", () => {
    const result = projectFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail validation if title is empty", () => {
    const invalidData = { ...validData, title: "" };
    const result = projectFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("العنوان مطلوب");
    }
  });

  it("should fail validation if status is invalid", () => {
    const invalidData = { ...validData, status: "unknown-status" as any };
    const result = projectFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should fail validation if liveUrl is not a valid URL", () => {
    const invalidData = { ...validData, liveUrl: "invalid-url-string" };
    const result = projectFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should pass validation if liveUrl is empty string or null", () => {
    const validDataWithEmptyUrl = { ...validData, liveUrl: "" };
    expect(projectFormSchema.safeParse(validDataWithEmptyUrl).success).toBe(true);

    const validDataWithNullUrl = { ...validData, liveUrl: null };
    expect(projectFormSchema.safeParse(validDataWithNullUrl).success).toBe(true);
  });
});
