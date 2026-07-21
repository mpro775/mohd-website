"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { clientApiRequest } from "@/lib/api/admin-client";
import type { Post, PostRevision } from "@/lib/api/types";

const reasons: Record<string, string> = { manual_save: "حفظ يدوي", autosave: "حفظ تلقائي", publish: "نشر", schedule: "جدولة", restore: "استعادة", migration: "ترحيل" };

export function RevisionsList({ postId }: { postId: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [items, setItems] = useState<PostRevision[]>([]);
  const [selected, setSelected] = useState<PostRevision | null>(null);
  useEffect(() => { void Promise.all([clientApiRequest<Post>(`/blog/posts/${postId}`), clientApiRequest<PostRevision[]>(`/blog/posts/${postId}/revisions`)]).then(([postResult, revisionResult]) => { setPost(postResult.data); setItems(revisionResult.data); }); }, [postId]);
  const load = async (revision: PostRevision) => { const id = revision.id ?? revision._id; if (!id) return; const result = await clientApiRequest<PostRevision>(`/blog/posts/${postId}/revisions/${id}`); setSelected(result.data); };
  const restore = async () => { if (!selected || !post || !window.confirm("استعادة هذا الإصدار وإنشاء إصدار جديد؟")) return; const id = selected.id ?? selected._id; await clientApiRequest(`/blog/posts/${postId}/revisions/${id}/restore`, { method: "POST", body: { expectedVersion: post.version } }); toast.success("تمت استعادة الإصدار"); window.location.reload(); };
  return <div className="space-y-5" dir="rtl"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">إصدارات {post?.title ?? "المقال"}</h1><p className="text-sm text-muted-foreground">اختر إصدارًا لعرض محتواه واستعادته بأمان.</p></div><Link href={`/admin/blog/posts/${postId}/edit`} className="rounded-lg border border-border px-3 py-2 text-sm">العودة للمحرر</Link></div><div className="grid gap-5 lg:grid-cols-[340px_1fr]"><aside className="premium-card max-h-[70vh] overflow-y-auto p-3">{items.map((item) => <button key={item.id ?? item._id} onClick={() => void load(item)} className="mb-2 block w-full rounded-lg border border-border p-3 text-right hover:border-primary"><span className="font-bold">الإصدار {item.revisionNumber}</span><span className="mr-2 text-xs text-primary">{reasons[item.reason]}</span><p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("ar-SA")} · {item.createdBy?.name ?? "النظام"}</p></button>)}</aside><main className="premium-card p-5">{selected ? <><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">معاينة الإصدار {selected.revisionNumber}</h2><button onClick={() => void restore()} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">استعادة</button></div><div className="grid gap-3 md:grid-cols-2"><div><p className="mb-2 text-xs font-bold">المحتوى المحفوظ</p><pre dir="ltr" className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-950 p-4 text-left text-xs text-zinc-100">{selected.snapshot?.content}</pre></div><div><p className="mb-2 text-xs font-bold">المحتوى الحالي</p><pre dir="ltr" className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-950 p-4 text-left text-xs text-zinc-100">{post?.content}</pre></div></div></> : <p className="text-muted-foreground">اختر إصدارًا من القائمة.</p>}</main></div></div>;
}
