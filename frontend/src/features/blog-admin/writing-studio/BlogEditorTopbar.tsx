"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowRight, Eye, MoreHorizontal, Save, SlidersHorizontal } from "lucide-react";
import type { AdminPostDetail, ReadinessResult } from "@/lib/api/types";
import type { AutosaveState } from "../hooks/usePostAutosave";
import { BlogEditorFocusButton } from "./BlogEditorFocusButton";
import { BlogPublishReadinessPopover } from "./BlogPublishReadinessPopover";
import { BlogSaveState } from "./BlogSaveState";

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  in_review: "قيد المراجعة",
  changes_requested: "مطلوب تعديل",
  approved: "معتمد",
  scheduled: "مجدول",
  published: "منشور",
  archived: "مؤرشف",
};

export function BlogEditorTopbar({
  post,
  busy,
  saveState,
  savedAt,
  focusMode,
  readiness,
  onToggleFocus,
  onPreview,
  onSave,
  onOpenInspector,
  onPrimaryAction,
  onRefreshReadiness,
}: {
  post: AdminPostDetail | null;
  busy: boolean;
  saveState: AutosaveState;
  savedAt: Date | null;
  focusMode: boolean;
  readiness: ReadinessResult | null;
  onToggleFocus: () => void;
  onPreview: () => void;
  onSave: () => void;
  onOpenInspector: () => void;
  onPrimaryAction: () => void;
  onRefreshReadiness: () => void;
}) {
  const status = post?.status ?? "draft";
  const primaryLabel = !post
    ? "حفظ المسودة"
    : status === "approved"
      ? "نشر الآن"
      : status === "in_review"
        ? "اعتماد"
        : status === "archived"
          ? "إعادة للمسودة"
          : ["draft", "changes_requested"].includes(status)
            ? "إرسال للمراجعة"
            : "إدارة النشر";
  return (
    <header className="sticky top-0 z-50 -mx-4 flex min-h-16 flex-wrap items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-2 shadow-sm backdrop-blur md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/admin/blog/posts" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-card" aria-label="العودة إلى المقالات">
          <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold">{statusLabels[status] ?? status}</span>
            <BlogSaveState state={saveState} savedAt={savedAt} onRetry={onSave} />
          </div>
          <p className="mt-1 hidden truncate text-[10px] text-muted-foreground sm:block">الإصدار {post?.version ?? 0}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <BlogPublishReadinessPopover result={readiness} onRefresh={onRefreshReadiness} />
        <BlogEditorFocusButton active={focusMode} onToggle={onToggleFocus} />
        <button type="button" onClick={onOpenInspector} className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card xl:hidden" aria-label="فتح خصائص المقال"><SlidersHorizontal className="h-4 w-4" /></button>
        <button type="button" onClick={onPreview} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-bold"><Eye className="h-4 w-4" /><span className="hidden sm:inline">معاينة</span></button>
        <button type="button" disabled={busy} onClick={onSave} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-bold disabled:opacity-50"><Save className="h-4 w-4" /><span className="hidden sm:inline">حفظ</span></button>
        <button type="button" disabled={busy} onClick={onPrimaryAction} className="hidden h-9 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground disabled:opacity-50 md:inline-flex md:items-center">{primaryLabel}</button>
        <DropdownMenu.Root dir="rtl">
          <DropdownMenu.Trigger asChild><button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card" aria-label="المزيد"><MoreHorizontal className="h-4 w-4" /></button></DropdownMenu.Trigger>
          <DropdownMenu.Portal><DropdownMenu.Content sideOffset={8} className="z-[80] min-w-48 rounded-xl border border-border bg-card p-1.5 text-xs font-bold shadow-xl">
            <DropdownMenu.Item onSelect={onPreview} className="cursor-pointer rounded-lg px-3 py-2 outline-none hover:bg-muted">فتح المعاينة</DropdownMenu.Item>
            {post ? <DropdownMenu.Item asChild><Link href={`/admin/blog/posts/${post.id ?? post._id}/revisions`} className="block cursor-pointer rounded-lg px-3 py-2 outline-none hover:bg-muted">سجل الإصدارات</Link></DropdownMenu.Item> : null}
            <DropdownMenu.Item onSelect={onOpenInspector} className="cursor-pointer rounded-lg px-3 py-2 outline-none hover:bg-muted">خصائص المقال</DropdownMenu.Item>
          </DropdownMenu.Content></DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
