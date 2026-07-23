import { describe, expect, it } from "vitest";
import { extractMarkdownOutline } from "./BlogOutlinePanel";

describe("extractMarkdownOutline", () => {
  it("extracts H2/H3, ignores code fences, and marks duplicates", () => {
    const items = extractMarkdownOutline(
      "## مقدمة\n### تفاصيل\n```md\n## ليس عنوانًا\n```\n## مقدمة",
    );
    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({ title: "مقدمة", duplicate: true });
    expect(items[1]).toMatchObject({ level: 3, title: "تفاصيل" });
  });
});
