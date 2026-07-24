"use client";

import {
  NestedLexicalEditor,
  type DirectiveDescriptor,
} from "@mdxeditor/editor";
import type { TextDirective } from "mdast-util-directive";
import type { PhrasingContent } from "mdast";

function BlogKbdDirectiveEditor() {
  return (
    <span className="blog-keyboard-key blog-editor-kbd-directive" dir="auto">
      <NestedLexicalEditor<TextDirective>
        getContent={(node) => node.children}
        getUpdatedMdastNode={(node, children) => ({
          ...node,
          children: children as PhrasingContent[],
        })}
        contentEditableProps={{
          className: "blog-editor-inline-content",
          "aria-label": "مفتاح لوحة المفاتيح، بحد أقصى 40 حرفًا",
        }}
      />
    </span>
  );
}

export const BlogKbdDirectiveDescriptor: DirectiveDescriptor<TextDirective> = {
  name: "kbd",
  type: "textDirective",
  attributes: [],
  hasChildren: true,
  testNode: (node) => node.type === "textDirective" && node.name === "kbd",
  Editor: BlogKbdDirectiveEditor,
};
