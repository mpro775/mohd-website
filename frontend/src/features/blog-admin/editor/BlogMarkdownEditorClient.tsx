"use client";

import { useEffect, useRef, useState } from "react";
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
import { ImagePlus } from "lucide-react";
import { EditorMediaDialog } from "./EditorMediaDialog";

const languages = { ts: "TypeScript", tsx: "TSX", js: "JavaScript", jsx: "JSX", json: "JSON", bash: "Bash", powershell: "PowerShell", dart: "Dart", php: "PHP", python: "Python", sql: "SQL", yaml: "YAML", dockerfile: "Dockerfile", html: "HTML", css: "CSS" };

export default function BlogMarkdownEditorClient({ markdown, savedMarkdown, onChange }: { markdown: string; savedMarkdown: string; onChange: (value: string) => void }) {
  const ref = useRef<MDXEditorMethods>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  useEffect(() => {
    if (ref.current && ref.current.getMarkdown() !== markdown) ref.current.setMarkdown(markdown);
  }, [markdown]);
  return <div className="overflow-hidden rounded-xl border border-border bg-background text-left" dir="ltr"><div className="flex items-center justify-end border-b border-border p-2"><button type="button" onClick={() => setMediaOpen(true)} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs"><ImagePlus className="h-4 w-4" />إدراج من مكتبة الوسائط</button></div><MDXEditor ref={ref} markdown={markdown} onChange={onChange} contentEditableClassName="prose-tech min-h-[560px] max-w-none px-6 py-5" plugins={[
    headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(), linkPlugin(), linkDialogPlugin(), tablePlugin(), imagePlugin(), codeBlockPlugin({ defaultCodeBlockLanguage: "ts" }), codeMirrorPlugin({ codeBlockLanguages: languages }), directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }), diffSourcePlugin({ diffMarkdown: savedMarkdown, viewMode: "rich-text" }), markdownShortcutPlugin(), toolbarPlugin({ toolbarContents: () => <DiffSourceToggleWrapper options={["rich-text", "source", "diff"]}><UndoRedo /><BlockTypeSelect /><BoldItalicUnderlineToggles /><CodeToggle /><ListsToggle options={["bullet", "number", "check"]} /><CreateLink /><InsertCodeBlock /><InsertTable /><InsertThematicBreak /><InsertAdmonition /></DiffSourceToggleWrapper> }),
  ]} /><EditorMediaDialog open={mediaOpen} onClose={() => setMediaOpen(false)} onInsert={(value) => { ref.current?.insertMarkdown(value); onChange(ref.current?.getMarkdown() ?? markdown); }} /></div>;
}
