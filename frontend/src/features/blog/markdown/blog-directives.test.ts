import { describe, expect, it } from "vitest";
import { remarkBlogDirectives } from "./blog-directives";
import type { BlogMarkdownRoot } from "./blog-markdown-types";

function transform(child: BlogMarkdownRoot["children"][number]) {
  const tree: BlogMarkdownRoot = { type: "root", children: [child] };
  remarkBlogDirectives()(tree);
  return tree.children[0];
}

describe("safe blog directives", () => {
  it("allowlists block text attributes and drops free styling", () => {
    const node = transform({
      type: "containerDirective",
      name: "text",
      attributes: {
        dir: "rtl",
        align: "justify",
        size: "lg",
        style: "background:url(javascript:alert(1))",
        class: "evil",
      },
      children: [{ type: "paragraph", children: [{ type: "text", value: "نص" }] }],
    });
    expect(node.data?.hName).toBe("blog-text");
    expect(node.data?.hProperties).toEqual({
      "data-dir": "rtl",
      "data-align": "justify",
      "data-size": "lg",
    });
  });

  it("supports inline highlight and keyboard keys safely", () => {
    const inline = transform({
      type: "textDirective",
      name: "text",
      attributes: { mark: "true", size: "xl", onclick: "alert(1)" },
      children: [{ type: "text", value: "مهم" }],
    });
    expect(inline.data?.hProperties).toEqual({
      "data-mark": "true",
      "data-size": "xl",
    });

    const kbd = transform({
      type: "textDirective",
      name: "kbd",
      attributes: {},
      children: [{ type: "text", value: "Ctrl + K" }],
    });
    expect(kbd.data?.hName).toBe("blog-kbd");
  });

  it("keeps existing callout and figure behavior", () => {
    expect(
      transform({
        type: "containerDirective",
        name: "tip",
        children: [{ type: "paragraph", children: [] }],
      }).data,
    ).toMatchObject({
      hName: "aside",
      hProperties: { "data-callout": "tip" },
    });
    expect(
      transform({
        type: "containerDirective",
        name: "figure",
        attributes: { src: "/media/image.png", alt: "صورة" },
        children: [{ type: "paragraph", children: [] }],
      }).data,
    ).toMatchObject({
      hName: "figure",
      hProperties: { "data-src": "/media/image.png", "data-alt": "صورة" },
    });
  });

  it("downgrades unknown directives without losing their text", () => {
    const node = transform({
      type: "textDirective",
      name: "script",
      attributes: { onclick: "alert(1)" },
      children: [{ type: "text", value: "محتوى آمن" }],
    });
    expect(node).toMatchObject({ type: "text", value: "محتوى آمن" });
    expect(node.data).toBeUndefined();
  });
});

