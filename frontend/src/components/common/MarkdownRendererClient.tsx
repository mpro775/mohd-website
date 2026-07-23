"use client";

import { MarkdownHooks } from "react-markdown";
import {
  markdownComponents,
  markdownRehypePlugins,
  markdownRemarkPlugins,
} from "./markdown-config";

export function MarkdownRendererClient({
  content,
  className = "",
}: {
  content?: string;
  className?: string;
}) {
  if (!content) return null;

  return (
    <article className={`prose-tech ${className}`}>
      <MarkdownHooks
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={markdownRehypePlugins}
        components={markdownComponents}
        fallback={
          <p className="text-sm text-muted-foreground">جارٍ تجهيز المعاينة…</p>
        }
      >
        {content}
      </MarkdownHooks>
    </article>
  );
}
