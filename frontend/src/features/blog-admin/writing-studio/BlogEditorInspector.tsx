"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { PanelLeftClose, PanelLeftOpen, SlidersHorizontal, X } from "lucide-react";
import type { BlogWritingStudioProps } from "./blog-writing-studio.types";
import { BlogEditorInspectorTabs } from "./BlogEditorInspectorTabs";

type Props = Pick<BlogWritingStudioProps, "form" | "post" | "busy" | "scheduleValue" | "readiness" | "onAction"> & {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  onRequestChanges: () => void;
  onArchive: () => void;
  onScheduleOpen: () => void;
};

export function BlogEditorInspector(props: Props) {
  const content = <BlogEditorInspectorTabs {...props} />;
  return (
    <>
      <aside className={`relative hidden shrink-0 xl:block ${props.collapsed ? "w-12" : "w-[340px]"}`}>
        <div className="sticky top-[76px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <button type="button" onClick={() => props.onCollapsedChange(!props.collapsed)} className="flex h-11 w-full items-center justify-center gap-2 border-b border-border text-xs font-bold text-muted-foreground hover:bg-muted" aria-label={props.collapsed ? "فتح الخصائص" : "طي الخصائص"}>
            {props.collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /> الخصائص</>}
          </button>
          {!props.collapsed ? content : null}
        </div>
      </aside>
      <Dialog.Root open={props.mobileOpen} onOpenChange={props.onMobileOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/55 xl:hidden" />
          <Dialog.Content dir="rtl" className="fixed inset-y-0 left-0 z-[81] w-[min(92vw,380px)] overflow-hidden border-r border-border bg-card shadow-2xl xl:hidden">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <Dialog.Title className="flex items-center gap-2 font-bold"><SlidersHorizontal className="h-4 w-4" /> خصائص المقال</Dialog.Title>
              <Dialog.Description className="sr-only">إعدادات النشر والتنظيم والوسائط وتحسين البحث والجودة.</Dialog.Description>
              <Dialog.Close className="rounded-lg p-2 hover:bg-muted" aria-label="إغلاق الخصائص"><X className="h-4 w-4" /></Dialog.Close>
            </div>
            {content}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
