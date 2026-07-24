import {
  parseBlogInlineTextOptions,
  parseBlogTextBlockOptions,
} from "./blog-format-contract";
import {
  blogMarkdownText,
  type BlogMarkdownNode,
} from "./blog-markdown-types";

const CALLOUT_TYPES = new Set(["note", "tip", "warning", "danger"]);

function safeFigure(
  node: BlogMarkdownNode,
  attributes: Record<string, unknown>,
) {
  const { src, alt } = attributes;
  if (typeof src !== "string" || typeof alt !== "string" || !alt.trim()) {
    node.type = "paragraph";
    delete node.data;
    return;
  }
  node.data = {
    ...(node.data ?? {}),
    hName: "figure",
    hProperties: { "data-src": src, "data-alt": alt },
  };
}

function downgradeUnknownDirective(node: BlogMarkdownNode) {
  const text = blogMarkdownText(node);
  delete node.data;
  if (node.type === "containerDirective") {
    node.type = "paragraph";
    return;
  }
  node.type = "text";
  node.value = text || (node.name ? `:${node.name}` : "");
  delete node.children;
  delete node.attributes;
  delete node.name;
}

export function remarkBlogDirectives() {
  return (tree: BlogMarkdownNode) => {
    const visit = (node: BlogMarkdownNode) => {
      const attributes = node.attributes ?? {};

      if (node.type === "containerDirective") {
        if (node.name && CALLOUT_TYPES.has(node.name)) {
          node.data = {
            ...(node.data ?? {}),
            hName: "aside",
            hProperties: { "data-callout": node.name },
          };
        } else if (node.name === "figure") {
          safeFigure(node, attributes);
        } else if (node.name === "text") {
          const options = parseBlogTextBlockOptions(attributes);
          node.data = {
            ...(node.data ?? {}),
            hName: "blog-text",
            hProperties: {
              "data-dir": options.dir,
              "data-align": options.align,
              "data-size": options.size,
            },
          };
        } else {
          downgradeUnknownDirective(node);
        }
      } else if (node.type === "textDirective" && node.name === "text") {
        const options = parseBlogInlineTextOptions(attributes);
        node.data = {
          ...(node.data ?? {}),
          hName: "blog-inline-text",
          hProperties: {
            "data-mark": options.mark ? "true" : "false",
            "data-size": options.size,
          },
        };
      } else if (node.type === "textDirective" && node.name === "kbd") {
        const value = blogMarkdownText(node);
        if (
          value.length <= 40 &&
          !/[\u0000-\u001F\u007F]/u.test(value) &&
          (node.children ?? []).every((child) => child.type === "text")
        ) {
          node.data = {
            ...(node.data ?? {}),
            hName: "blog-kbd",
            hProperties: {},
          };
        } else {
          downgradeUnknownDirective(node);
        }
      } else if (
        node.type === "containerDirective" ||
        node.type === "leafDirective" ||
        node.type === "textDirective"
      ) {
        downgradeUnknownDirective(node);
      }

      for (const child of node.children ?? []) visit(child);
    };

    visit(tree);
  };
}

export { CALLOUT_TYPES };
