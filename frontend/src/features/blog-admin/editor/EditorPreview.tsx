"use client";

import { MarkdownRendererClient } from "@/components/common/MarkdownRendererClient";

export function EditorPreview({ content }: { content: string }) {
  return (
    <MarkdownRendererClient
      content={content}
      className="min-h-[560px] rounded-xl border border-border bg-card p-6"
    />
  );
}
