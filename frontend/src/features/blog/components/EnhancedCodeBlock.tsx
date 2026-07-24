"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CopyCodeButton } from "./CodeBlock";
import {
  blogCodeMaxHeightClass,
  parseBlogCodeMeta,
} from "../markdown/blog-code-meta";
import { blogCodeLanguageLabel } from "../markdown/blog-code-languages";

export function EnhancedCodeBlock({
  code,
  language,
  meta,
  children,
}: {
  code: string;
  language?: string;
  meta?: string;
  children: ReactNode;
}) {
  const { options } = parseBlogCodeMeta(meta, language);
  const [expanded, setExpanded] = useState(
    !(options.collapsible && options.collapsed),
  );
  const title = options.title?.trim();
  const label = blogCodeLanguageLabel(language);

  return (
    <section
      className={[
        "enhanced-code-block",
        options.wrap ? "blog-code-wrap" : "blog-code-nowrap",
        options.lineNumbers ? "blog-code-line-numbers" : "",
        blogCodeMaxHeightClass(options.maxHeight),
      ]
        .filter(Boolean)
        .join(" ")}
      dir="ltr"
      data-blog-code-block
    >
      <header className="blog-code-header">
        <div className="min-w-0">
          {title ? (
            <div className="blog-code-title" title={title}>
              {title}
            </div>
          ) : null}
          <div className="blog-code-language">{label}</div>
        </div>
        <div className="blog-code-actions">
          {options.collapsible ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="blog-code-action"
              aria-expanded={expanded}
              aria-label={expanded ? "طي الكود" : "فتح الكود"}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {expanded ? "طي" : "فتح"}
            </button>
          ) : null}
          <CopyCodeButton code={code} />
        </div>
      </header>
      {expanded ? (
        <div className="blog-code-viewport" tabIndex={0}>
          {children}
        </div>
      ) : (
        <div className="blog-code-collapsed" aria-hidden="true">
          الكود مطوي
        </div>
      )}
    </section>
  );
}

