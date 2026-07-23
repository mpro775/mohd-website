"use client";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function BlogArchiveDialog({
  open,
  onOpenChange,
  onConfirm,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  busy?: boolean;
}) {
  return (
    <ConfirmDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      onConfirm={onConfirm}
      title="أرشفة المقال"
      description="سيختفي المقال من تدفق النشر، ويمكن إعادته إلى المسودة لاحقًا."
      confirmText="أرشفة المقال"
      variant="danger"
      isSubmitting={busy}
    />
  );
}
