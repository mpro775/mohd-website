import { describe, expect, it } from "vitest";
import { extractHeadings } from "./blog-markdown";

describe("blog markdown", () => {
  it("creates unique stable TOC ids and ignores code fences", () => {
    const headings = extractHeadings("## مقدمة\n### تفاصيل\n## مقدمة\n```md\n## ليس عنوانًا\n```");
    expect(headings.map((item) => item.id)).toEqual(["مقدمة", "تفاصيل", "مقدمة-1"]);
  });

  it("preserves technical markdown as an immutable source string", () => {
    const markdown = "```tsx\n<div className=\"card\">Hello</div>\n```\n\nArray<T> and x < y";
    expect(`${markdown}`).toBe(markdown);
  });
});
