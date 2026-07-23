"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

export function buildRequestChangesPayload(message: string) {
  return { message: message.trim() };
}

export function BlogRequestChangesDialog({
  open,
  onOpenChange,
  onSubmit,
  busy = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (message: string) => void;
  busy?: boolean;
}) {
  const [message, setMessage] = useState("");
  const handleOpenChange = (next: boolean) => {
    if (!next) setMessage("");
    onOpenChange(next);
  };
  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/60" />
        <Dialog.Content dir="rtl" className="fixed left-1/2 top-1/2 z-[91] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <Dialog.Title className="text-xl font-bold">طلب تعديلات على المقال</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            اكتب ملاحظات واضحة يستطيع الكاتب تنفيذها.
          </Dialog.Description>
          <label className="mt-5 block text-sm font-bold">
            رسالة التعديلات
            <textarea
              autoFocus
              rows={6}
              maxLength={1000}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background p-3 font-normal outline-none focus:border-primary"
              aria-describedby="request-changes-counter"
            />
          </label>
          <p id="request-changes-counter" className="mt-1 text-left text-xs text-muted-foreground">
            {message.length} / 1000
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close className="rounded-lg border border-border px-4 py-2 text-sm font-bold">إلغاء</Dialog.Close>
            <button
              type="button"
              disabled={busy || !message.trim()}
              onClick={() => onSubmit(message.trim())}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              إرسال الطلب
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
