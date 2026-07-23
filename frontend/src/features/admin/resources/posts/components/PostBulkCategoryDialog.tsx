"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import { useTaxonomyOptions } from "@/features/blog-admin/hooks/useTaxonomyOptions";

export function PostBulkCategoryDialog({
  open,
  onOpenChange,
  count,
  type = "category",
  onConfirm,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  type?: "category" | "tag";
  onConfirm: (id: string) => void;
  busy?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const { items, loading, hasMore, loadMore } = useTaxonomyOptions(type, search);
  const noun = type === "tag" ? "وسم" : "تصنيف";
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/60" />
        <Dialog.Content dir="rtl" className="fixed left-1/2 top-1/2 z-[91] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <Dialog.Title className="text-xl font-bold">{type === "tag" ? "إضافة وسم" : "تعيين تصنيف"}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">سيُطبّق الاختيار على {count.toLocaleString("ar-SA")} مقالات.</Dialog.Description>
          <div className="relative mt-4"><Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`ابحث عن ${noun}…`} className="h-10 w-full rounded-xl border border-border bg-background pr-9 pl-3 text-sm" /></div>
          <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
            {items.map((item) => <button key={item.id} type="button" onClick={() => setSelected(item.id)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${selected === item.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}><span>{item.name}</span><span className="text-[10px] opacity-70" dir="ltr">{item.slug}</span></button>)}
            {loading ? <p className="p-2 text-center text-xs text-muted-foreground">جارٍ التحميل…</p> : null}
            {hasMore ? <button type="button" onClick={loadMore} className="w-full p-2 text-xs font-bold text-primary">تحميل المزيد</button> : null}
          </div>
          <div className="mt-5 flex justify-end gap-2"><Dialog.Close className="rounded-lg border border-border px-4 py-2 text-sm font-bold">إلغاء</Dialog.Close><button type="button" disabled={busy || !selected} onClick={() => onConfirm(selected)} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">تطبيق</button></div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
