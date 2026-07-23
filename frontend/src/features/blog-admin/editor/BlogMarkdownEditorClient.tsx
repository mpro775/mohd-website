"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
  AdmonitionDirectiveDescriptor,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
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
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
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
  mode?: "rich-text" | "source" | "diff";
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
  mode = "rich-text",
  onChange,
}: BlogMarkdownEditorClientProps) {
  const ref = useRef<MDXEditorMethods>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<File | null>(null);

  useEffect(() => {
    if (ref.current && ref.current.getMarkdown() !== markdown)
      ref.current.setMarkdown(markdown);
  }, [markdown]);

  const importFile = (file: File) => {
    if (file.size > 1 * 1024 * 1024) {
      toast.error("حجم ملف Markdown كبير جدًا");
      return;
    }
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

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const current = ref.current?.getMarkdown() ?? markdown;
    if (current.trim()) {
      setPendingImport(file);
      return;
    }
    importFile(file);
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
      className="blog-writing-editor overflow-hidden rounded-2xl border border-border bg-card"
      dir="rtl"
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
        key={mode}
        ref={ref}
        markdown={markdown}
        onChange={onChange}
        contentEditableClassName="prose-tech mdxeditor-rich-text-editor mx-auto min-h-[560px] max-w-[820px] px-5 py-8 md:px-10"
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
            viewMode: mode,
          }),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <div className="flex min-w-max items-center gap-2 px-1" dir="ltr">
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
              </div>
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
      <ConfirmDialog
        isOpen={Boolean(pendingImport)}
        onClose={() => setPendingImport(null)}
        onConfirm={() => {
          if (pendingImport) importFile(pendingImport);
          setPendingImport(null);
        }}
        title="استبدال محتوى المقال"
        description="سيستبدل ملف Markdown المحتوى الحالي بالكامل. لا يمكن التراجع عن ذلك بعد الحفظ."
        confirmText="استيراد واستبدال"
        variant="warning"
      />
    </div>
  );
}
