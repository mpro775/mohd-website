"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
  className?: string;
  size?: "md" | "lg" | "xl";
}

export function ResourceFormDrawer({
  isOpen,
  onClose,
  title,
  description,
  onSubmit,
  isSubmitting = false,
  submitLabel = "حفظ البيانات",
  cancelLabel = "إلغاء",
  children,
  className,
  size = "md",
}: ResourceFormDrawerProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Backdrop overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" />
        
        {/* Slide-over sheet content */}
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 left-0 z-50 h-full w-full border-r border-border bg-card shadow-2xl flex flex-col justify-between duration-300 animate-in slide-in-from-left focus:outline-none",
            size === "md" && "max-w-xl",
            size === "lg" && "max-w-3xl",
            size === "xl" && "max-w-5xl",
            className
          )}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border select-none">
            <div className="space-y-1.5 text-right">
              <DialogPrimitive.Title className="text-lg font-black text-foreground">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-xs text-muted-foreground leading-relaxed">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          {/* Form Scroll Body */}
          <form onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar bg-background/25">
              {children}
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-end gap-3 select-none">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <span>{submitLabel}</span>
                )}
              </button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
