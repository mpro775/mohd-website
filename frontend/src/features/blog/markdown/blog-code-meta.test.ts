import { describe, expect, it } from "vitest";
import {
  blogCodeMetaForPrettyCode,
  isValidBlogHighlight,
  normalizeBlogCodeMeta,
  parseBlogCodeMeta,
  parseBlogHighlightLines,
  serializeBlogCodeMeta,
} from "./blog-code-meta";

describe("blog code metadata", () => {
  it("parses quoted titles and every supported property", () => {
    const result = parseBlogCodeMeta(
      'title="components/User Card.tsx" maxHeight="320" wrap="true" lineNumbers="true" collapsible="true" collapsed="true" highlight="2,4-6"',
      "tsx",
    );
    expect(result.warnings).toEqual([]);
    expect(result.options).toEqual({
      language: "tsx",
      title: "components/User Card.tsx",
      maxHeight: "320",
      wrap: true,
      lineNumbers: true,
      collapsible: true,
      collapsed: true,
      highlight: "2,4-6",
    });
  });

  it("uses safe defaults for malformed, duplicate and unknown values", () => {
    const result = parseBlogCodeMeta(
      'maxHeight="999" wrap="yes" wrap="true" onclick="alert(1)" highlight="0,1-999999"',
    );
    expect(result.options.maxHeight).toBe("auto");
    expect(result.options.wrap).toBe(false);
    expect(result.options.highlight).toBeUndefined();
    expect(result.warnings.length).toBeGreaterThanOrEqual(4);
  });

  it("serializes in canonical order and round trips escaped titles", () => {
    const serialized = serializeBlogCodeMeta({
      language: "ts",
      highlight: "2,4-6",
      title: 'User "Card".tsx',
      lineNumbers: true,
      maxHeight: "420",
      wrap: true,
      collapsible: true,
      collapsed: true,
    });
    expect(serialized).toBe(
      'title="User \\"Card\\".tsx" maxHeight="420" wrap="true" lineNumbers="true" collapsible="true" collapsed="true" highlight="2,4-6"',
    );
    expect(parseBlogCodeMeta(serialized).options.title).toBe(
      'User "Card".tsx',
    );
    expect(normalizeBlogCodeMeta(serialized)).toBe(serialized);
  });

  it("bounds highlight ranges by syntax and actual line count", () => {
    expect(isValidBlogHighlight("1-3,8,10-12")).toBe(true);
    expect(isValidBlogHighlight("0,2")).toBe(false);
    expect(isValidBlogHighlight("1-10001")).toBe(false);
    expect([...parseBlogHighlightLines("2,4-6", 5)]).toEqual([2, 4, 5]);
  });

  it("translates only safe highlighting hints for Shiki", () => {
    expect(
      blogCodeMetaForPrettyCode(
        'title="<img onerror=alert(1)>" lineNumbers="true" highlight="2,4-6"',
      ),
    ).toBe("{2,4-6} showLineNumbers");
  });
});

