"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
  AdmonitionDirectiveDescriptor,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertAdmonition,
  InsertCodeBlock,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  type MDXEditorMethods,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  directivesPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { Download, ImagePlus, Upload } from "lucide-react";
import { toast } from "sonner";
import { EditorMediaDialog } from "./EditorMediaDialog";

const languages = {
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  json: "JSON",
  bash: "Bash",
  powershell: "PowerShell",
  dart: "Dart",
  php: "PHP",
  python: "Python",
  sql: "SQL",
  yaml: "YAML",
  dockerfile: "Dockerfile",
  html: "HTML",
  css: "CSS",
  mermaid: "Mermaid",
};

type BlogMarkdownEditorClientProps = {
  markdown: string;
  savedMarkdown: string;
  exportFileName?: string;
  onChange: (value: string) => void;
};

function safeMarkdownFileName(value?: string): string {
  const name = (value || "article")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/-+/g, "-");
  return `${name || "article"}.md`;
}

export default function BlogMarkdownEditorClient({
  markdown,
  savedMarkdown,
  exportFileName,
  onChange,
}: BlogMarkdownEditorClientProps) {
  const ref = useRef<MDXEditorMethods>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [mediaOpen, setMediaOpen] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.getMarkdown() !== markdown)
      ref.current.setMarkdown(markdown);
  }, [markdown]);

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast.error("حجم ملف Markdown كبير جدًا");
      return;
    }

    const current = ref.current?.getMarkdown() ?? markdown;
    if (
      current.trim() &&
      !window.confirm(
        "سيستبدل الاستيراد محتوى المقال الحالي. هل تريد المتابعة؟",
      )
    )
      return;

    const reader = new FileReader();
    reader.onerror = () => toast.error("تعذّرت قراءة ملف Markdown");
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        toast.error("محتوى ملف Markdown غير صالح");
        return;
      }

      const MAX_MARKDOWN_LENGTH = 500_000;
      if (reader.result.length > MAX_MARKDOWN_LENGTH) {
        toast.error("ملف Markdown يتجاوز الحد الأقصى المسموح");
        return;
      }

      ref.current?.setMarkdown(reader.result);
      onChange(reader.result);
      toast.success("تم استيراد ملف Markdown");
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleExport = () => {
    const content = ref.current?.getMarkdown() ?? markdown;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = safeMarkdownFileName(exportFileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-background text-left"
      dir="ltr"
    >
      <div
        className="flex flex-wrap items-center justify-end gap-2 border-b border-border p-2"
        dir="rtl"
      >
        <input
          ref={importInputRef}
          type="file"
          accept=".md,text/markdown,text/plain"
          className="hidden"
          onChange={handleImport}
        />
        <button
          type="button"
          onClick={() => importInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs"
        >
          <Upload className="h-4 w-4" />
          استيراد Markdown
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs"
        >
          <Download className="h-4 w-4" />
          تصدير Markdown
        </button>
        <button
          type="button"
          onClick={() => setMediaOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs"
        >
          <ImagePlus className="h-4 w-4" />
          إدراج من مكتبة الوسائط
        </button>
      </div>
      <MDXEditor
        ref={ref}
        markdown={markdown}
        onChange={onChange}
        contentEditableClassName="prose-tech min-h-[560px] max-w-none px-6 py-5"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          tablePlugin(),
          imagePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "ts" }),
          codeMirrorPlugin({ codeBlockLanguages: languages }),
          directivesPlugin({
            directiveDescriptors: [AdmonitionDirectiveDescriptor],
          }),
          diffSourcePlugin({
            diffMarkdown: savedMarkdown,
            viewMode: "rich-text",
          }),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper
                options={["rich-text", "source", "diff"]}
              >
                <UndoRedo />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <CodeToggle />
                <ListsToggle options={["bullet", "number", "check"]} />
                <CreateLink />
                <InsertCodeBlock />
                <InsertTable />
                <InsertThematicBreak />
                <InsertAdmonition />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />
      <EditorMediaDialog
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onInsert={(value) => {
          ref.current?.insertMarkdown(value);
          onChange(ref.current?.getMarkdown() ?? markdown);
        }}
      />
    </div>
  );
}
