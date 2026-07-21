"use client";

import { useState } from "react";
import { MediaPicker } from "@/components/admin/MediaPicker";

type SelectedMedia = { id?: string; _id?: string; url: string; alt?: string; originalName?: string; filename?: string };

export function EditorMediaDialog({ open, onClose, onInsert }: { open: boolean; onClose: () => void; onInsert: (markdown: string) => void }) {
  const [selected, setSelected] = useState<SelectedMedia | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  if (!open && !selected) return null;
  if (!selected) {
    return <MediaPicker isOpen={open} onClose={onClose} allowedType="image" defaultFolder="blog" onSelect={(item) => { setSelected(item); setAlt(item.alt ?? ""); }} />;
  }
  const confirm = () => {
    if (!alt.trim()) return;
    const markdown = buildMediaMarkdown(selected.url, alt, caption);
    onInsert(markdown);
    setSelected(null); setAlt(""); setCaption(""); onClose();
  };
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4"><div className="w-full max-w-lg rounded-xl border border-border bg-card p-5"><h2 className="text-lg font-bold">بيانات الصورة داخل المقال</h2><img src={selected.url} alt="" className="mt-4 max-h-52 w-full rounded-lg object-contain" /><label className="mt-4 block text-sm font-bold">النص البديل <span className="text-danger">*</span><input value={alt} onChange={(event) => setAlt(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background p-2" /></label><label className="mt-4 block text-sm font-bold">التعليق التوضيحي (اختياري)<textarea value={caption} onChange={(event) => setCaption(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background p-2" rows={3} /></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => { setSelected(null); onClose(); }} className="rounded-lg border border-border px-4 py-2">إلغاء</button><button type="button" disabled={!alt.trim()} onClick={confirm} className="rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground disabled:opacity-40">إدراج الصورة</button></div></div></div>;
}

export function buildMediaMarkdown(url: string, alt: string, caption = ""): string {
  const safeAlt = alt.trim();
  if (!safeAlt) throw new Error("النص البديل مطلوب");
  return caption.trim()
    ? `\n:::figure{src="${url}" alt="${safeAlt.replace(/"/g, "&quot;")}"}\n${caption.trim()}\n:::\n`
    : `\n![${safeAlt.replace(/]/g, "\\]")}](${url})\n`;
}
