"use client";

import { Columns2, Eye, FileCode2, PenLine } from "lucide-react";
import type { BlogEditorMode } from "./blog-writing-studio.types";

const modes: Array<{
  value: BlogEditorMode;
  label: string;
  icon: typeof PenLine;
}> = [
  { value: "write", label: "كتابة", icon: PenLine },
  { value: "markdown", label: "Markdown", icon: FileCode2 },
  { value: "diff", label: "مقارنة", icon: Columns2 },
  { value: "preview", label: "معاينة", icon: Eye },
];

export function BlogEditorModeTabs({
  value,
  onChange,
}: {
  value: BlogEditorMode;
  onChange: (value: BlogEditorMode) => void;
}) {
  return (
    <div
      className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1"
      role="tablist"
      aria-label="وضع المحرر"
    >
      {modes.map(({ value: mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-selected={value === mode}
          onClick={() => onChange(mode)}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
            value === mode
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
