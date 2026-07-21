"use client";

import { useId, useState } from "react";
import { Plus, X } from "lucide-react";
import { FieldError, FieldLabel } from "./FieldComponents";

type TagInputProps = {
  label: string;
  value?: string[];
  onChange: (value: string[]) => void;
  error?: string;
  placeholder?: string;
  maxItems?: number;
  maxLength?: number;
};

export function TagInput({
  label,
  value = [],
  onChange,
  error,
  placeholder = "اكتب ثم اضغط Enter",
  maxItems = 50,
  maxLength = 80,
}: TagInputProps) {
  const id = useId();
  const [draft, setDraft] = useState("");

  const add = () => {
    const next = draft.trim();
    if (!next || next.length > maxLength || value.length >= maxItems) return;
    if (value.some((item) => item.toLocaleLowerCase() === next.toLocaleLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, next]);
    setDraft("");
  };

  return (
    <div className="space-y-2" dir="rtl">
      <FieldLabel htmlFor={id} label={label} />
      <div className="rounded-lg border border-border bg-card p-3 focus-within:border-primary">
        {value.length ? (
          <div className="mb-3 flex flex-wrap gap-2" aria-label={`${label} المضافة`}>
            {value.map((tag) => (
              <span key={tag.toLocaleLowerCase()} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {tag}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((item) => item !== tag))}
                  aria-label={`إزالة ${tag}`}
                  className="rounded-full p-0.5 hover:bg-primary/15"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex gap-2">
          <input
            id={id}
            value={draft}
            maxLength={maxLength}
            disabled={value.length >= maxItems}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                add();
              }
            }}
            placeholder={value.length >= maxItems ? "تم بلوغ الحد الأقصى" : placeholder}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <button type="button" onClick={add} aria-label={`إضافة إلى ${label}`} className="inline-flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-bold text-primary-foreground disabled:opacity-50" disabled={!draft.trim() || value.length >= maxItems}>
            <Plus className="h-3.5 w-3.5" />
            إضافة
          </button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">{value.length} / {maxItems}</p>
      <FieldError error={error} />
    </div>
  );
}
