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

  it("ignores headings inside backtick and tilde fences", () => {
    const content = `
## عنوان حقيقي

\`\`\`md
## ليس عنوانًا
\`\`\`

~~~md
### ليس عنوانًا أيضًا
~~~

### عنوان فرعي
`;

    expect(extractHeadings(content).map((item) => item.text)).toEqual([
      "عنوان حقيقي",
      "عنوان فرعي",
    ]);
  });
});
