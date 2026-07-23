"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { UseFormReturn } from "react-hook-form";
import { adminClient } from "@/lib/api/admin-client";
import { useTaxonomyOptions } from "../hooks/useTaxonomyOptions";
import type { PostEditorValues } from "../schemas/post-editor.schema";

function OptionPicker({ type, selected, onChange, multiple }: { type: "category" | "tag"; selected: string[]; onChange: (ids: string[]) => void; multiple?: boolean }) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const { items, loading, hasMore, loadMore } = useTaxonomyOptions(type, search);
  const create = async () => {
    if (!createName.trim()) return;
    const result = await adminClient.createResource<{ id?: string; _id?: string }>(`blog/${type === "tag" ? "tags" : "categories"}`, { name: createName.trim() });
    const id = result.data.id ?? result.data._id;
    if (id) onChange(multiple ? [...new Set([...selected, id])] : [id]);
    setCreateName("");
    setCreateOpen(false);
  };
  return <div className="space-y-2"><div className="flex gap-2"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالاسم…" className="min-w-0 flex-1 rounded-lg border border-border bg-background p-2 text-sm" /><button type="button" onClick={() => setCreateOpen(true)} className="rounded-lg border border-border px-2 text-xs">إنشاء</button></div><div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">{items.map((item) => { const active = selected.includes(item.id); return <button key={item.id} type="button" onClick={() => onChange(multiple ? active ? selected.filter((id) => id !== item.id) : [...selected, item.id] : [item.id])} className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}><span>{item.name}</span><span className="font-mono text-[10px] opacity-70">{item.slug}</span></button>; })}{loading ? <p className="p-2 text-xs text-muted-foreground">جارٍ التحميل…</p> : null}{hasMore ? <button type="button" onClick={loadMore} className="w-full p-2 text-xs text-primary">تحميل المزيد</button> : null}</div><div className="flex flex-wrap gap-1">{selected.map((id) => <span key={id} className="rounded-full bg-muted px-2 py-1 text-[10px]">{items.find((item) => item.id === id)?.name ?? (type === "tag" ? "وسم محدد" : "تصنيف محدد")}<button type="button" onClick={() => onChange(selected.filter((item) => item !== id))} className="mr-1" aria-label="إزالة">×</button></span>)}</div><Dialog.Root open={createOpen} onOpenChange={setCreateOpen}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60" /><Dialog.Content dir="rtl" className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5 shadow-xl"><Dialog.Title className="font-bold">{type === "tag" ? "إنشاء وسم" : "إنشاء تصنيف"}</Dialog.Title><Dialog.Description className="mt-1 text-xs text-muted-foreground">أدخل اسمًا واضحًا ثم أضفه إلى المقال.</Dialog.Description><label className="mt-4 block text-xs font-bold">الاسم<input autoFocus value={createName} onChange={(event) => setCreateName(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background p-2 text-sm" /></label><div className="mt-4 flex justify-end gap-2"><Dialog.Close className="rounded-lg border border-border px-3 py-2 text-xs font-bold">إلغاء</Dialog.Close><button type="button" onClick={() => void create()} disabled={!createName.trim()} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">إنشاء وإضافة</button></div></Dialog.Content></Dialog.Portal></Dialog.Root></div>;
}

export function PostTaxonomyPanel({ form }: { form: UseFormReturn<PostEditorValues> }) {
  const category = form.watch("category");
  const tags = form.watch("tags");
  return <section className="premium-card space-y-4 p-4"><h2 className="font-bold">التصنيف والوسوم</h2><div><p className="mb-2 text-xs font-bold">التصنيف</p><OptionPicker type="category" selected={category ? [category] : []} onChange={(ids) => form.setValue("category", ids[0] ?? "", { shouldDirty: true })} /></div><div><p className="mb-2 text-xs font-bold">الوسوم</p><OptionPicker type="tag" selected={tags} multiple onChange={(ids) => form.setValue("tags", ids, { shouldDirty: true })} /></div></section>;
}
