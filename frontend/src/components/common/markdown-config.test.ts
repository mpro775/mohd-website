import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MarkdownAsync } from "react-markdown";
import {
  markdownComponents,
  markdownRehypePlugins,
  markdownRemarkPlugins,
  rehypeCaptureBlogCodeMeta,
  rehypeMermaidCodeBlocks,
} from "./markdown-config";

describe("shared Markdown pipeline", () => {
  it("extracts Mermaid fences before syntax highlighting", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "pre",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "code",
              properties: { className: ["language-mermaid"] },
              children: [{ type: "text", value: "flowchart TD\nA-->B\n" }],
            },
          ],
        },
      ],
    };

    rehypeMermaidCodeBlocks()(tree);

    expect(tree.children[0]).toEqual({
      type: "element",
      tagName: "mermaid-diagram",
      properties: {},
      children: [{ type: "text", value: "flowchart TD\nA-->B" }],
    });
  });

  it("keeps regular code fences in the Shiki pipeline", () => {
    const codeBlock = {
      type: "element",
      tagName: "pre",
      properties: {},
      children: [
        {
          type: "element",
          tagName: "code",
          properties: { className: ["language-ts"] },
          children: [{ type: "text", value: "const ok = true;\n" }],
        },
      ],
    };
    const tree = { type: "root", children: [codeBlock] };

    rehypeMermaidCodeBlocks()(tree);

    expect(tree.children[0]).toBe(codeBlock);
  });

  it("captures only canonical code metadata for the enhanced renderer", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "pre",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "code",
              data: {
                meta: 'title="User Card.tsx" maxHeight="320" lineNumbers="true" onclick="alert(1)"',
              },
              properties: { className: ["language-tsx"] },
              children: [{ type: "text", value: "export const ok = true;\n" }],
            },
          ],
        },
      ],
    };

    rehypeCaptureBlogCodeMeta()(tree);

    expect(tree.children[0].properties).toEqual({
      dataBlogCodeLanguage: "tsx",
      dataBlogCodeMeta:
        'title="User Card.tsx" maxHeight="320" lineNumbers="true"',
    });
  });

  it("renders the complete safe advanced Markdown fixture", async () => {
    const content = [
      ':::text{dir="rtl" align="justify" size="lead" style="background:url(javascript:alert(1))"}',
      "فقرة :text[مهمة]{mark=\"true\" size=\"lg\" onclick=\"alert(1)\"} مع :kbd[Ctrl + K].",
      ":::",
      "",
      '```tsx title="<img src=x onerror=alert(1)>" maxHeight="320" wrap="true" lineNumbers="true" collapsible="true" highlight="2"',
      "const first = true;",
      "const second = true;",
      "```",
    ].join("\n");

    const output = await MarkdownAsync({
      children: content,
      remarkPlugins: markdownRemarkPlugins,
      rehypePlugins: markdownRehypePlugins,
      components: markdownComponents,
    });
    const html = renderToStaticMarkup(output);

    expect(html).toContain("blog-text-dir-rtl");
    expect(html).toContain("blog-text-align-justify");
    expect(html).toContain("blog-inline-mark");
    expect(html).toContain("<kbd");
    expect(html).toContain("enhanced-code-block");
    expect(html).toContain("blog-code-height-320");
    expect(html).toContain("blog-code-line-numbers");
    expect(html).toContain('data-highlighted-line=""');
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("onclick=");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  }, 20_000);
});
