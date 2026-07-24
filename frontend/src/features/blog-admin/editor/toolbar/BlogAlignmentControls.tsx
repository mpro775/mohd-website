"use client";

import {
  BLOG_FORMAT_LABELS,
  BLOG_TEXT_ALIGNMENTS,
  type BlogTextAlign,
} from "@/features/blog/markdown/blog-format-contract";
import { useBlogEditorCommands } from "../extensions/blog-editor-commands";

export function BlogAlignmentControls() {
  const { paragraphOptions, applyParagraphOptions } = useBlogEditorCommands();
  return (
    <select
      className="blog-editor-select"
      aria-label="محاذاة الفقرة"
      title="محاذاة الفقرة"
      value={paragraphOptions.align}
      onChange={(event) =>
        applyParagraphOptions({ align: event.target.value as BlogTextAlign })
      }
    >
      {BLOG_TEXT_ALIGNMENTS.map((value) => (
        <option key={value} value={value}>
          {BLOG_FORMAT_LABELS.alignments[value]}
        </option>
      ))}
    </select>
  );
}

