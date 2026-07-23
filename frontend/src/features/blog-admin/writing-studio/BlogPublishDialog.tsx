"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Ban, CheckCircle2 } from "lucide-react";
import type { ReadinessResult } from "@/lib/api/types";

export function BlogPublishDialog({
  open,
  onOpenChange,
  result,
  onConfirm,
  busy,
  confirmLabel = "المتابعة والنشر",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ReadinessResult | null;
  onConfirm: () => void;
  busy?: boolean;
  confirmLabel?: string;
}) {
  const blocked = Boolean(result?.blockers.length);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/60" />
        <Dialog.Content dir="rtl" className="fixed left-1/2 top-1/2 z-[91] max-h-[85vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <Dialog.Title className="text-xl font-bold">فحص جاهزية المقال</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            راجع نتيجة الفحص قبل تنفيذ الإجراء.
          </Dialog.Description>
          <div className="mt-5 space-y-3">
            {result?.blockers.map((item) => (
              <div key={item.code} className="flex gap-2 rounded-xl bg-danger/10 p-3 text-sm text-danger">
                <Ban className="mt-0.5 h-4 w-4 shrink-0" />
                {item.message}
              </div>
            ))}
            {result?.warnings.map((item) => (
              <div key={item.code} className="flex gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-500">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {item.message}
              </div>
            ))}
            {result?.ready && !result.warnings.length ? (
              <div className="flex gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                المقال جاهز للنشر.
              </div>
            ) : null}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close className="rounded-lg border border-border px-4 py-2 text-sm font-bold">إلغاء</Dialog.Close>
            <button type="button" disabled={busy || blocked} onClick={onConfirm} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40">
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
