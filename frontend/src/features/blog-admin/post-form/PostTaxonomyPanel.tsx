"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { adminClient } from "@/lib/api/admin-client";
import { useTaxonomyOptions } from "../hooks/useTaxonomyOptions";
import type { PostEditorValues } from "../schemas/post-editor.schema";

function OptionPicker({ type, selected, onChange, multiple }: { type: "category" | "tag"; selected: string[]; onChange: (ids: string[]) => void; multiple?: boolean }) {
  const [search, setSearch] = useState("");
  const { items, loading, hasMore, loadMore } = useTaxonomyOptions(type, search);
  const create = async () => {
    const name = window.prompt(type === "tag" ? "اسم الوسم الجديد" : "اسم التصنيف الجديد");
    if (!name?.trim()) return;
    const result = await adminClient.createResource<{ id?: string; _id?: string }>(`blog/${type === "tag" ? "tags" : "categories"}`, { name: name.trim() });
    const id = result.data.id ?? result.data._id;
    if (id) onChange(multiple ? [...new Set([...selected, id])] : [id]);
  };
  return <div className="space-y-2"><div className="flex gap-2"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث…" className="min-w-0 flex-1 rounded-lg border border-border bg-background p-2 text-sm" /><button type="button" onClick={create} className="rounded-lg border border-border px-2 text-xs">إنشاء</button></div><div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">{items.map((item) => { const active = selected.includes(item.id); return <button key={item.id} type="button" onClick={() => onChange(multiple ? active ? selected.filter((id) => id !== item.id) : [...selected, item.id] : [item.id])} className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}><span>{item.name}</span><span className="font-mono text-[10px] opacity-70">{item.slug}</span></button>; })}{loading ? <p className="p-2 text-xs text-muted-foreground">جارٍ التحميل…</p> : null}{hasMore ? <button type="button" onClick={loadMore} className="w-full p-2 text-xs text-primary">تحميل المزيد</button> : null}</div><div className="flex flex-wrap gap-1">{selected.map((id) => <span key={id} className="rounded-full bg-muted px-2 py-1 font-mono text-[10px]">{items.find((item) => item.id === id)?.name ?? id}<button type="button" onClick={() => onChange(selected.filter((item) => item !== id))} className="mr-1" aria-label="إزالة">×</button></span>)}</div></div>;
}

export function PostTaxonomyPanel({ form }: { form: UseFormReturn<PostEditorValues> }) {
  const category = form.watch("category");
  const tags = form.watch("tags");
  return <section className="premium-card space-y-4 p-4"><h2 className="font-bold">التصنيف والوسوم</h2><div><p className="mb-2 text-xs font-bold">التصنيف</p><OptionPicker type="category" selected={category ? [category] : []} onChange={(ids) => form.setValue("category", ids[0] ?? "", { shouldDirty: true })} /></div><div><p className="mb-2 text-xs font-bold">الوسوم</p><OptionPicker type="tag" selected={tags} multiple onChange={(ids) => form.setValue("tags", ids, { shouldDirty: true })} /></div></section>;
}
