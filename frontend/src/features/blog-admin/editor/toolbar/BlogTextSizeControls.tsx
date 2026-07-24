"use client";

import {
  BLOG_FORMAT_LABELS,
  BLOG_INLINE_TEXT_SIZES,
  BLOG_TEXT_SIZES,
  type BlogInlineTextSize,
  type BlogTextSize,
} from "@/features/blog/markdown/blog-format-contract";
import { useBlogEditorCommands } from "../extensions/blog-editor-commands";

export function BlogTextSizeControls() {
  const {
    paragraphOptions,
    inlineOptions,
    isTextSelected,
    applyParagraphOptions,
    applyInlineOptions,
  } = useBlogEditorCommands();
  const values = isTextSelected ? BLOG_INLINE_TEXT_SIZES : BLOG_TEXT_SIZES;
  const value = isTextSelected ? inlineOptions.size : paragraphOptions.size;

  return (
    <select
      className="blog-editor-select"
      aria-label={isTextSelected ? "حجم النص المحدد" : "حجم الفقرة"}
      title={isTextSelected ? "حجم النص المحدد" : "حجم الفقرة"}
      value={value}
      onChange={(event) => {
        if (isTextSelected)
          applyInlineOptions({
            size: event.target.value as BlogInlineTextSize,
          });
        else
          applyParagraphOptions({ size: event.target.value as BlogTextSize });
      }}
    >
      {values.map((item) => (
        <option key={item} value={item}>
          {BLOG_FORMAT_LABELS.sizes[item]}
        </option>
      ))}
    </select>
  );
}

