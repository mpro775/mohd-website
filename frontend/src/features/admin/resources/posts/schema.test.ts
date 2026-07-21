import { describe, expect, it } from "vitest";
import { EMPTY_POST_VALUES, postEditorSchema } from "@/features/blog-admin/schemas/post-editor.schema";

describe("post editor schema", () => {
  it("does not expose workflow status or legacy publication fields", () => {
    expect("status" in postEditorSchema.shape).toBe(false);
    expect("publishDate" in postEditorSchema.shape).toBe(false);
    expect("readTime" in postEditorSchema.shape).toBe(false);
    expect(() => postEditorSchema.parse({ ...EMPTY_POST_VALUES, title: "عنوان صالح", summary: "ملخص صالح يتجاوز عشرين حرفًا للنشر", content: "# محتوى", category: "507f1f77bcf86cd799439011" })).not.toThrow();
  });
});
