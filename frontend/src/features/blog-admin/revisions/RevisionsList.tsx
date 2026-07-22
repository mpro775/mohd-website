"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { clientApiRequest } from "@/lib/api/admin-client";
import type { AdminPostDetail, PostRevision, PostRevisionSnapshot } from "@/lib/api/types";
import { RevisionContentDiff } from "./RevisionContentDiff";
import { RevisionMetadataDiff } from "./RevisionMetadataDiff";

const reasons: Record<string, string> = { manual_save: "حفظ يدوي", autosave: "حفظ تلقائي", publish: "نشر", schedule: "جدولة", restore: "استعادة", migration: "ترحيل" };

export function RevisionsList({ postId }: { postId: string }) {
  const [post, setPost] = useState<AdminPostDetail | null>(null);
  const [items, setItems] = useState<PostRevision[]>([]);
  const [selected, setSelected] = useState<PostRevision | null>(null);
  const [baseId, setBaseId] = useState<string>("current");
  const [baseRevision, setBaseRevision] = useState<PostRevision | null>(null);

  useEffect(() => { 
    void Promise.all([
      clientApiRequest<AdminPostDetail>(`/blog/posts/${postId}`), 
      clientApiRequest<PostRevision[]>(`/blog/posts/${postId}/revisions`)
    ]).then(([postResult, revisionResult]) => { 
      setPost(postResult.data); 
      setItems(revisionResult.data); 
    }); 
  }, [postId]);

  useEffect(() => {
    if (baseId === "current" || !baseId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBaseRevision(null);
    } else {
      clientApiRequest<PostRevision>(`/blog/posts/${postId}/revisions/${baseId}`)
        .then(result => setBaseRevision(result.data));
    }
  }, [baseId, postId]);

  const load = async (revision: PostRevision) => { 
    const id = revision.id ?? revision._id; 
    if (!id) return; 
    const result = await clientApiRequest<PostRevision>(`/blog/posts/${postId}/revisions/${id}`); 
    setSelected(result.data); 
  };
  
  const restore = async () => { 
    if (!selected || !post || !window.confirm("استعادة هذا الإصدار وإنشاء إصدار جديد؟")) return; 
    const id = selected.id ?? selected._id; 
    await clientApiRequest(`/blog/posts/${postId}/revisions/${id}/restore`, { method: "POST", body: { expectedVersion: post.version } }); 
    toast.success("تمت استعادة الإصدار"); 
    window.location.reload(); 
  };

  const currentSnapshot: Partial<PostRevisionSnapshot> = post ? {
    title: post.title,
    summary: post.summary,
    content: (post as any).content, // AdminPostDetail has content
    category: post.category,
    tags: post.tags,
    canonicalUrl: (post as any).canonicalUrl,
    seo: post.seo,
  } : {};

  const baseSnapshot = baseId === "current" ? currentSnapshot : (baseRevision?.snapshot ?? {});
  const targetSnapshot = selected?.snapshot ?? {};

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إصدارات {post?.title ?? "المقال"}</h1>
          <p className="text-sm text-muted-foreground">اختر إصدارًا لعرض محتواه واستعادته بأمان.</p>
        </div>
        <Link href={`/admin/blog/posts/${postId}/edit`} className="rounded-lg border border-border px-3 py-2 text-sm">العودة للمحرر</Link>
      </div>
      
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="premium-card max-h-[70vh] overflow-y-auto p-3">
          {items.map((item) => (
            <button 
              key={item.id ?? item._id} 
              onClick={() => void load(item)} 
              className={`mb-2 block w-full rounded-lg border p-3 text-right transition-colors ${selected?.id === item.id || selected?._id === item._id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold">الإصدار {item.revisionNumber}</span>
                <span className="text-xs text-primary">{reasons[item.reason]}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleString("ar-SA")} · {item.createdBy?.name ?? "النظام"}
              </p>
            </button>
          ))}
        </aside>
        
        <main className="premium-card p-5 overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div>
                  <h2 className="font-bold text-lg">معاينة الإصدار {selected.revisionNumber}</h2>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">مقارنة مع:</span>
                    <select 
                      value={baseId} 
                      onChange={(e) => setBaseId(e.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
                    >
                      <option value="current">الإصدار الحالي (Current)</option>
                      {items.filter(i => (i.id || i._id) !== (selected.id || selected._id)).map(item => (
                        <option key={item.id ?? item._id} value={item.id ?? item._id}>
                          الإصدار {item.revisionNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={() => void restore()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">
                  استعادة الإصدار {selected.revisionNumber}
                </button>
              </div>
              
              <div className="space-y-8 flex-1 overflow-y-auto pr-2">
                <div>
                  <h3 className="font-bold mb-4">فروقات المحتوى</h3>
                  <RevisionContentDiff 
                    oldText={baseSnapshot.content ?? ""} 
                    newText={targetSnapshot.content ?? ""} 
                  />
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">فروقات البيانات (Metadata)</h3>
                  <RevisionMetadataDiff 
                    base={baseSnapshot} 
                    target={targetSnapshot} 
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">اختر إصدارًا من القائمة للمقارنة.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
