"use client";

import React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { AlertTriangle, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isSubmitting?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "danger",
  isSubmitting = false,
}: ConfirmDialogProps) {
  const [localSubmitting, setLocalSubmitting] = React.useState(false);

  const activeSubmitting = isSubmitting || localSubmitting;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLocalSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setLocalSubmitting(false);
      onClose();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="h-6 w-6 text-danger" />,
          iconBg: "bg-danger/10",
          actionBtn: "bg-danger text-white hover:bg-danger/90 focus:ring-danger",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="h-6 w-6 text-warning" />,
          iconBg: "bg-warning/10",
          actionBtn: "bg-warning text-primary-foreground hover:bg-warning/90 focus:ring-warning",
        };
      default:
        return {
          icon: <Info className="h-6 w-6 text-primary" />,
          iconBg: "bg-primary/10",
          actionBtn: "bg-primary text-primary-foreground hover:bg-primary/95 focus:ring-primary",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" />
        <AlertDialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-lg duration-200 animate-in fade-in-50 zoom-in-95 sm:rounded-xl md:w-full",
            "focus:outline-none"
          )}
          dir="rtl"
        >
          <div className="flex gap-4">
            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", styles.iconBg)}>
              {styles.icon}
            </div>
            <div className="space-y-1 text-right flex-1">
              <AlertDialogPrimitive.Title className="text-lg font-bold text-foreground">
                {title}
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </AlertDialogPrimitive.Description>
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <AlertDialogPrimitive.Cancel
              disabled={activeSubmitting}
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-border disabled:opacity-50 cursor-pointer"
            >
              {cancelText}
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action
              disabled={activeSubmitting}
              onClick={handleConfirm}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card disabled:opacity-50 cursor-pointer",
                styles.actionBtn
              )}
            >
              {activeSubmitting ? "جاري المعالجة..." : confirmText}
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
