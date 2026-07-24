"use client";

import {
  NestedLexicalEditor,
  type DirectiveDescriptor,
  type DirectiveEditorProps,
  useMdastNodeUpdater,
} from "@mdxeditor/editor";
import type { ContainerDirective } from "mdast-util-directive";
import type { BlockContent, DefinitionContent } from "mdast";
import {
  BLOG_FORMAT_LABELS,
  BLOG_TEXT_ALIGNMENTS,
  BLOG_TEXT_DIRECTIONS,
  BLOG_TEXT_SIZES,
  parseBlogTextBlockOptions,
  serializeBlogTextBlockAttributes,
  type BlogTextAlign,
  type BlogTextDirection,
  type BlogTextSize,
} from "@/features/blog/markdown/blog-format-contract";
import type { BlogMarkdownNode } from "@/features/blog/markdown/blog-markdown-types";

function BlogTextDirectiveEditor({
  mdastNode,
}: DirectiveEditorProps<ContainerDirective>) {
  const updateMdastNode = useMdastNodeUpdater<ContainerDirective>();
  const node = mdastNode as BlogMarkdownNode;
  const options = parseBlogTextBlockOptions(node.attributes);

  const update = (
    changes: Partial<{
      dir: BlogTextDirection;
      align: BlogTextAlign;
      size: BlogTextSize;
    }>,
  ) => {
    updateMdastNode({
      attributes: serializeBlogTextBlockAttributes({ ...options, ...changes }),
    });
  };

  return (
    <div
      className={[
        "blog-editor-directive blog-text-block",
        `blog-text-dir-${options.dir}`,
        `blog-text-align-${options.align}`,
        `blog-text-size-${options.size}`,
      ].join(" ")}
      data-blog-dir={options.dir}
    >
      <div
        className="blog-editor-directive-controls"
        dir="rtl"
        contentEditable={false}
      >
        <select
          className="blog-editor-select"
          aria-label="اتجاه الفقرة"
          value={options.dir}
          onChange={(event) =>
            update({ dir: event.target.value as BlogTextDirection })
          }
        >
          {BLOG_TEXT_DIRECTIONS.map((value) => (
            <option key={value} value={value}>
              {BLOG_FORMAT_LABELS.directions[value]}
            </option>
          ))}
        </select>
        <select
          className="blog-editor-select"
          aria-label="محاذاة الفقرة"
          value={options.align}
          onChange={(event) =>
            update({ align: event.target.value as BlogTextAlign })
          }
        >
          {BLOG_TEXT_ALIGNMENTS.map((value) => (
            <option key={value} value={value}>
              {BLOG_FORMAT_LABELS.alignments[value]}
            </option>
          ))}
        </select>
        <select
          className="blog-editor-select"
          aria-label="حجم الفقرة"
          value={options.size}
          onChange={(event) =>
            update({ size: event.target.value as BlogTextSize })
          }
        >
          {BLOG_TEXT_SIZES.map((value) => (
            <option key={value} value={value}>
              {BLOG_FORMAT_LABELS.sizes[value]}
            </option>
          ))}
        </select>
      </div>
      <NestedLexicalEditor<ContainerDirective>
        block
        getContent={(currentNode) => currentNode.children}
        getUpdatedMdastNode={(currentNode, children) => ({
          ...currentNode,
          children: children as Array<BlockContent | DefinitionContent>,
        })}
        contentEditableProps={{
          className: "blog-editor-directive-content",
          "aria-label": "محتوى الفقرة المنسقة",
        }}
      />
    </div>
  );
}

export const BlogTextDirectiveDescriptor: DirectiveDescriptor<ContainerDirective> = {
  name: "text",
  type: "containerDirective",
  attributes: ["dir", "align", "size"],
  hasChildren: true,
  testNode: (node) =>
    node.type === "containerDirective" && node.name === "text",
  Editor: BlogTextDirectiveEditor,
};
