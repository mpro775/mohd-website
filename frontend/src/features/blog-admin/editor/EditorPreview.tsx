"use client";

import { MarkdownRendererClient } from "@/components/common/MarkdownRendererClient";

export function EditorPreview({ content }: { content: string }) {
  return (
    <MarkdownRendererClient
      content={content}
      className="mx-auto min-h-[560px] max-w-[820px] rounded-2xl border border-border bg-card p-6 shadow-sm md:p-10"
    />
  );
}
