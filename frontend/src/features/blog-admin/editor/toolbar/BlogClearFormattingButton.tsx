"use client";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_BLOG_TEXT_BLOCK_OPTIONS } from "@/features/blog/markdown/blog-format-contract";
import { useBlogEditorCommands } from "../extensions/blog-editor-commands";

export function BlogClearFormattingButton() {
  const { applyParagraphOptions } = useBlogEditorCommands();
  return (
    <button
      type="button"
      className="blog-editor-control"
      aria-label="إعادة تنسيق الفقرة"
      title="إعادة تنسيق الفقرة"
      onClick={() => {
        if (!applyParagraphOptions(DEFAULT_BLOG_TEXT_BLOCK_OPTIONS))
          toast.info("الفقرة بالتنسيق الافتراضي بالفعل");
      }}
    >
      <RotateCcw className="h-4 w-4" />
    </button>
  );
}

