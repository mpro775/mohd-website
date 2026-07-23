"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CalendarClock } from "lucide-react";

export function BlogScheduleDialog({
  open,
  onOpenChange,
  value,
  onValueChange,
  onConfirm,
  busy = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  onConfirm: () => void;
  busy?: boolean;
}) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const summary = value
    ? new Date(value).toLocaleString("ar-SA", { dateStyle: "full", timeStyle: "short" })
    : "اختر التاريخ والوقت";
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/60" />
        <Dialog.Content dir="rtl" className="fixed left-1/2 top-1/2 z-[91] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <Dialog.Title className="flex items-center gap-2 text-xl font-bold">
            <CalendarClock className="h-5 w-5 text-primary" />
            جدولة النشر
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            سيُنشر المقال تلقائيًا في الموعد المحدد.
          </Dialog.Description>
          <label className="mt-5 block text-sm font-bold">
            التاريخ والوقت
            <input
              type="datetime-local"
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background p-3"
              dir="ltr"
            />
          </label>
          <div className="mt-4 rounded-xl bg-muted/50 p-3 text-sm">
            <p className="font-bold">{summary}</p>
            <p className="mt-1 text-xs text-muted-foreground" dir="ltr">{timezone}</p>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close className="rounded-lg border border-border px-4 py-2 text-sm font-bold">إلغاء</Dialog.Close>
            <button type="button" disabled={busy || !value} onClick={onConfirm} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
              تأكيد الجدولة
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
