"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { AdminPostDetail } from "@/lib/api/types";
import { RevisionContentDiff } from "../revisions/RevisionContentDiff";

export function BlogConflictDialog({
  serverPost,
  localContent,
  onClose,
  onLoadServer,
}: {
  serverPost: AdminPostDetail | null;
  localContent: string;
  onClose: () => void;
  onLoadServer: () => void;
}) {
  return (
    <Dialog.Root open={Boolean(serverPost)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/65" />
        <Dialog.Content dir="rtl" className="fixed left-1/2 top-1/2 z-[101] max-h-[90vh] w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <Dialog.Title className="text-xl font-bold text-danger">تعارض نسخة المقال</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            عُدّل المقال من جلسة أخرى. قارن النسختين قبل اختيار نسخة الخادم.
          </Dialog.Description>
          {serverPost ? (
            <div className="mt-5">
              <RevisionContentDiff oldText={serverPost.content} newText={localContent} />
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => navigator.clipboard.writeText(localContent)} className="rounded-lg border border-border px-3 py-2 text-sm font-bold">
              نسخ نسختي المحلية
            </button>
            <button type="button" onClick={onLoadServer} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">
              تحميل نسخة الخادم
            </button>
            <Dialog.Close className="rounded-lg border border-border px-3 py-2 text-sm font-bold">إغلاق</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
