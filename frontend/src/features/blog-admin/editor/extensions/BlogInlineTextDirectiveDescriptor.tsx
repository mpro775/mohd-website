"use client";

import {
  NestedLexicalEditor,
  type DirectiveDescriptor,
  type DirectiveEditorProps,
  useMdastNodeUpdater,
} from "@mdxeditor/editor";
import type { TextDirective } from "mdast-util-directive";
import type { PhrasingContent } from "mdast";
import {
  BLOG_FORMAT_LABELS,
  BLOG_INLINE_TEXT_SIZES,
  parseBlogInlineTextOptions,
  serializeBlogInlineTextAttributes,
  type BlogInlineTextSize,
} from "@/features/blog/markdown/blog-format-contract";
import type { BlogMarkdownNode } from "@/features/blog/markdown/blog-markdown-types";

function BlogInlineTextDirectiveEditor({
  mdastNode,
}: DirectiveEditorProps<TextDirective>) {
  const updateMdastNode = useMdastNodeUpdater<TextDirective>();
  const node = mdastNode as BlogMarkdownNode;
  const options = parseBlogInlineTextOptions(node.attributes);

  const update = (changes: Partial<typeof options>) => {
    updateMdastNode({
      attributes: serializeBlogInlineTextAttributes({
        ...options,
        ...changes,
      }),
    });
  };

  return (
    <span
      className={[
        "blog-inline-text blog-editor-inline-directive",
        `blog-inline-size-${options.size}`,
        options.mark ? "blog-inline-mark" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="blog-editor-inline-tools" contentEditable={false}>
        <button
          type="button"
          className="blog-editor-control"
          data-active={options.mark}
          aria-label={options.mark ? "إزالة التمييز" : "تمييز النص"}
          title={options.mark ? "إزالة التمييز" : "تمييز النص"}
          onClick={() => update({ mark: !options.mark })}
        >
          تمييز
        </button>
        <select
          className="blog-editor-select"
          aria-label="حجم النص المحدد"
          value={options.size}
          onChange={(event) =>
            update({ size: event.target.value as BlogInlineTextSize })
          }
        >
          {BLOG_INLINE_TEXT_SIZES.map((value) => (
            <option key={value} value={value}>
              {BLOG_FORMAT_LABELS.sizes[value]}
            </option>
          ))}
        </select>
      </span>
      <NestedLexicalEditor<TextDirective>
        getContent={(currentNode) => currentNode.children}
        getUpdatedMdastNode={(currentNode, children) => ({
          ...currentNode,
          children: children as PhrasingContent[],
        })}
        contentEditableProps={{
          className: "blog-editor-inline-content",
          "aria-label": "النص المنسق",
        }}
      />
    </span>
  );
}

export const BlogInlineTextDirectiveDescriptor: DirectiveDescriptor<TextDirective> = {
  name: "text-inline",
  type: "textDirective",
  attributes: ["mark", "size"],
  hasChildren: true,
  testNode: (node) => node.type === "textDirective" && node.name === "text",
  Editor: BlogInlineTextDirectiveEditor,
};
