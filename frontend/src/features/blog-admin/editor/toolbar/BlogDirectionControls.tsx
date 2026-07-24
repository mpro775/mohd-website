"use client";

import {
  BLOG_FORMAT_LABELS,
  BLOG_TEXT_DIRECTIONS,
  type BlogTextDirection,
} from "@/features/blog/markdown/blog-format-contract";
import { useBlogEditorCommands } from "../extensions/blog-editor-commands";

export function BlogDirectionControls() {
  const { paragraphOptions, applyParagraphOptions } = useBlogEditorCommands();
  return (
    <select
      className="blog-editor-select"
      aria-label="اتجاه الفقرة"
      title="اتجاه الفقرة"
      value={paragraphOptions.dir}
      onChange={(event) =>
        applyParagraphOptions({
          dir: event.target.value as BlogTextDirection,
        })
      }
    >
      {BLOG_TEXT_DIRECTIONS.map((value) => (
        <option key={value} value={value}>
          {BLOG_FORMAT_LABELS.directions[value]}
        </option>
      ))}
    </select>
  );
}

