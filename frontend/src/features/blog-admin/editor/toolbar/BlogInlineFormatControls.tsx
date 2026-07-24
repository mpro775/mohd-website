"use client";

import { DialogButton } from "@mdxeditor/editor";
import { Highlighter, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { useBlogEditorCommands } from "../extensions/blog-editor-commands";

export function BlogInlineFormatControls() {
  const {
    inlineOptions,
    isTextSelected,
    applyInlineOptions,
    insertKbd,
  } = useBlogEditorCommands();

  return (
    <>
      <button
        type="button"
        className="blog-editor-control"
        data-active={inlineOptions.mark}
        disabled={!isTextSelected && !inlineOptions.mark}
        aria-label={inlineOptions.mark ? "إزالة تمييز النص" : "تمييز النص"}
        title={inlineOptions.mark ? "إزالة تمييز النص" : "تمييز النص"}
        onClick={() => {
          if (!applyInlineOptions({ mark: !inlineOptions.mark }))
            toast.error("حدد نصًا داخل فقرة واحدة أولًا");
        }}
      >
        <Highlighter className="h-4 w-4" />
      </button>
      {isTextSelected ? (
        <button
          type="button"
          className="blog-editor-control"
          aria-label="تحويل التحديد إلى مفتاح لوحة مفاتيح"
          title="مفتاح لوحة مفاتيح"
          onClick={() => {
            if (!insertKbd())
              toast.error("يجب ألا يتجاوز نص المفتاح 40 حرفًا");
          }}
        >
          <Keyboard className="h-4 w-4" />
        </button>
      ) : (
        <DialogButton
          tooltipTitle="إدراج مفتاح لوحة مفاتيح"
          dialogInputPlaceholder="Ctrl + K"
          submitButtonTitle="إدراج"
          buttonContent={<Keyboard className="h-4 w-4" />}
          onSubmit={(value) => {
            if (!insertKbd(value))
              toast.error("أدخل نصًا لا يتجاوز 40 حرفًا");
          }}
        />
      )}
    </>
  );
}

