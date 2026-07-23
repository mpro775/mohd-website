"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";

export function BlogUnsavedChangesDialog({
  open,
  onSaveAndLeave,
  onLeave,
  onStay,
}: {
  open: boolean;
  onSaveAndLeave: () => void;
  onLeave: () => void;
  onStay: () => void;
}) {
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[110] bg-black/65" />
        <AlertDialog.Content dir="rtl" className="fixed left-1/2 top-1/2 z-[111] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <AlertDialog.Title className="text-xl font-bold">تغييرات غير محفوظة</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            لديك تعديلات لم تُحفظ بعد. اختر ما تريد فعله قبل المغادرة.
          </AlertDialog.Description>
          <div className="mt-5 flex flex-col gap-2">
            <AlertDialog.Action onClick={onSaveAndLeave} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              حفظ ومغادرة
            </AlertDialog.Action>
            <AlertDialog.Action onClick={onLeave} className="rounded-lg border border-danger/40 px-4 py-2 text-sm font-bold text-danger">
              مغادرة دون حفظ
            </AlertDialog.Action>
            <AlertDialog.Cancel onClick={onStay} className="rounded-lg border border-border px-4 py-2 text-sm font-bold">
              البقاء
            </AlertDialog.Cancel>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
