"use client";

import { BlogMarkdownEditor } from "../editor/BlogMarkdownEditor";
import { EditorPreview } from "../editor/EditorPreview";
import { BlogEditorModeTabs } from "./BlogEditorModeTabs";
import { BlogWordMetrics } from "./BlogWordMetrics";
import type { BlogEditorMode } from "./blog-writing-studio.types";

export function BlogEditorWorkspace({
  mode,
  onModeChange,
  markdown,
  savedMarkdown,
  exportFileName,
  onChange,
}: {
  mode: BlogEditorMode;
  onModeChange: (mode: BlogEditorMode) => void;
  markdown: string;
  savedMarkdown: string;
  exportFileName: string;
  onChange: (value: string) => void;
}) {
  const editorMode =
    mode === "markdown" ? "source" : mode === "diff" ? "diff" : "rich-text";
  return (
    <section className="mx-auto w-full max-w-[960px] space-y-3">
      <div className="flex items-center justify-between gap-3">
        <BlogEditorModeTabs value={mode} onChange={onModeChange} />
      </div>
      <div className={mode === "preview" ? "rounded-2xl bg-muted/20 p-2 md:p-5" : ""}>
        {mode === "preview" ? (
          <EditorPreview content={markdown} />
        ) : (
          <BlogMarkdownEditor
            markdown={markdown}
            savedMarkdown={savedMarkdown}
            exportFileName={exportFileName}
            mode={editorMode}
            onChange={onChange}
          />
        )}
      </div>
      <BlogWordMetrics content={markdown} />
    </section>
  );
}
