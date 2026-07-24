export type BlogMarkdownNode = {
  type: string;
  name?: string;
  value?: string;
  tagName?: string;
  attributes?: Record<string, unknown> | null;
  properties?: Record<string, unknown>;
  data?: Record<string, unknown>;
  children?: BlogMarkdownNode[];
  [key: string]: unknown;
};

export type BlogMarkdownRoot = BlogMarkdownNode & {
  type: "root";
  children: BlogMarkdownNode[];
};

export function blogMarkdownText(node: BlogMarkdownNode): string {
  if (node.type === "text" || node.type === "inlineCode")
    return node.value ?? "";
  if (node.type === "break") return "\n";
  return (node.children ?? []).map(blogMarkdownText).join("");
}

