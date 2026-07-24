"use client";

import { useState } from "react";
import {
  CodeMirrorEditor,
  type CodeBlockEditorDescriptor,
  type CodeBlockEditorProps,
  useCodeBlockEditorContext,
} from "@mdxeditor/editor";
import {
  BLOG_CODE_MAX_HEIGHTS,
  isValidBlogHighlight,
  parseBlogCodeMeta,
  serializeBlogCodeMeta,
} from "@/features/blog/markdown/blog-code-meta";
import {
  BLOG_FORMAT_LABELS,
  type BlogCodeBlockOptions,
  type BlogCodeMaxHeight,
} from "@/features/blog/markdown/blog-format-contract";
import { BLOG_CODE_LANGUAGES } from "@/features/blog/markdown/blog-code-languages";

function BlogCodeBlockEditor(props: CodeBlockEditorProps) {
  const { setLanguage, setMeta } = useCodeBlockEditorContext();
  const { options, warnings } = parseBlogCodeMeta(props.meta, props.language);
  const [highlightDraft, setHighlightDraft] = useState({
    sourceMeta: props.meta,
    value: options.highlight ?? "",
  });
  const visibleHighlight =
    highlightDraft.sourceMeta === props.meta
      ? highlightDraft.value
      : (options.highlight ?? "");

  const update = (changes: Partial<BlogCodeBlockOptions>) => {
    setMeta(serializeBlogCodeMeta({ ...options, ...changes }));
  };

  return (
    <div className="blog-code-editor-shell" dir="ltr">
      <div className="blog-code-editor-inspector">
        <select
          className="blog-editor-select"
          aria-label="لغة الكود"
          value={props.language || "ts"}
          onChange={(event) => setLanguage(event.target.value)}
        >
          {Object.entries(BLOG_CODE_LANGUAGES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          className="blog-editor-input min-w-[180px] flex-1"
          aria-label="عنوان أو اسم ملف الكود"
          placeholder="اسم الملف (اختياري)"
          value={options.title ?? ""}
          maxLength={100}
          onChange={(event) =>
            update({ title: event.target.value || undefined })
          }
        />
        <select
          className="blog-editor-select"
          aria-label="الحد الأقصى لارتفاع الكود"
          value={options.maxHeight}
          onChange={(event) =>
            update({ maxHeight: event.target.value as BlogCodeMaxHeight })
          }
        >
          {BLOG_CODE_MAX_HEIGHTS.map((value) => (
            <option key={value} value={value}>
              {BLOG_FORMAT_LABELS.codeHeights[value]}
            </option>
          ))}
        </select>
        {(
          [
            ["wrap", "التفاف الأسطر"],
            ["lineNumbers", "أرقام الأسطر"],
            ["collapsible", "قابل للطي"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="blog-editor-control">
            <input
              type="checkbox"
              checked={options[key]}
              onChange={(event) => update({ [key]: event.target.checked })}
            />
            {label}
          </label>
        ))}
        {options.collapsible ? (
          <label className="blog-editor-control">
            <input
              type="checkbox"
              checked={options.collapsed}
              onChange={(event) =>
                update({ collapsed: event.target.checked })
              }
            />
            مطوي افتراضيًا
          </label>
        ) : null}
        <input
          className="blog-editor-input w-[150px]"
          dir="ltr"
          aria-label="الأسطر المميزة"
          placeholder="2,4-6"
          value={visibleHighlight}
          onChange={(event) => {
            const value = event.target.value.trim();
            setHighlightDraft({ sourceMeta: props.meta, value });
            if (!value || isValidBlogHighlight(value))
              update({ highlight: value || undefined });
          }}
        />
        {warnings.length ||
        (visibleHighlight && !isValidBlogHighlight(visibleHighlight)) ? (
          <p className="blog-code-editor-warning" role="status">
            {warnings[0] ?? "صيغة الأسطر المميزة غير صحيحة."}
          </p>
        ) : null}
      </div>
      <CodeMirrorEditor {...props} />
    </div>
  );
}

export const BlogCodeBlockEditorDescriptor: CodeBlockEditorDescriptor = {
  priority: 10,
  match: () => true,
  Editor: BlogCodeBlockEditor,
};
