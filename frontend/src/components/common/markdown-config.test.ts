import { describe, expect, it } from "vitest";
import { rehypeMermaidCodeBlocks } from "./markdown-config";

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
});
