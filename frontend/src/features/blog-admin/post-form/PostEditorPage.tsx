"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Save } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";
import { clientApiRequest } from "@/lib/api/admin-client";
import type { AdminPostDetail } from "@/lib/api/types";
import { BlogMarkdownEditor } from "../editor/BlogMarkdownEditor";
import { EditorPreview } from "../editor/EditorPreview";
import { EditorStatusBar } from "../editor/EditorStatusBar";
import { usePostAutosave } from "../hooks/usePostAutosave";
import { usePostConflict } from "../hooks/usePostConflict";
import { usePostReadiness } from "../hooks/usePostReadiness";
import { EMPTY_POST_VALUES, postDraftPersistenceSchema, postEditorSchema, type PostEditorValues } from "../schemas/post-editor.schema";
import { clearEditorDraft, draftStorageKey, loadEditorDraft, saveEditorDraft } from "../utils/editor-draft-storage";
import { datetimeLocalToUtc, utcToDatetimeLocal } from "../utils/post-date";
import { PostBasicsPanel } from "./PostBasicsPanel";
import { PostMediaPanel } from "./PostMediaPanel";
import { PostPublishingPanel } from "./PostPublishingPanel";
import { PostReadinessPanel } from "./PostReadinessPanel";
import { PostRelatedPanel } from "./PostRelatedPanel";
import { PostSeoPanel } from "./PostSeoPanel";
import { PostTaxonomyPanel } from "./PostTaxonomyPanel";

function entityId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String((value as { id?: string; _id?: string }).id ?? (value as { _id?: string })._id ?? "");
}

function valuesFromPost(post: AdminPostDetail): PostEditorValues {
  return {
    ...EMPTY_POST_VALUES,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    excerpt: post.excerpt ?? "",
    content: post.content,
    category: entityId(post.category),
    tags: (post.tags ?? []).map(entityId).filter(Boolean),
    relatedPostIds: post.relatedPostIds ?? [],
    featuredImageMediaId: post.featuredImageMediaId ?? null,
    featuredImage: post.featuredImage ?? null,
    coverImageMediaId: post.coverImageMediaId ?? null,
    coverImage: post.coverImage ?? null,
    isFeatured: Boolean(post.isFeatured),
    featuredOrder: post.featuredOrder ?? 0,
    allowIndexing: post.allowIndexing !== false,
    canonicalUrl: post.canonicalUrl ?? "",
    seo: { metaTitle: post.seo?.metaTitle ?? "", metaDescription: post.seo?.metaDescription ?? "", ogImageMediaId: post.seo?.ogImageMediaId ?? null, ogImage: post.seo?.ogImage ?? null },
  };
}

function editablePayload(values: PostEditorValues) {
  return {
    title: values.title,
    slug: values.slug || undefined,
    summary: values.summary,
    excerpt: values.excerpt || undefined,
    content: values.content,
    category: values.category || undefined,
    tags: values.tags,
    relatedPostIds: values.relatedPostIds,
    featuredImageMediaId: values.featuredImageMediaId || undefined,
    coverImageMediaId: values.coverImageMediaId || undefined,
    isFeatured: values.isFeatured,
    featuredOrder: values.isFeatured ? values.featuredOrder : undefined,
    allowIndexing: values.allowIndexing,
    canonicalUrl: values.canonicalUrl || undefined,
    seo: { metaTitle: values.seo.metaTitle || undefined, metaDescription: values.seo.metaDescription || undefined, ogImageMediaId: values.seo.ogImageMediaId || undefined },
  };
}

export function PostEditorPage({ postId }: { postId?: string }) {
  const router = useRouter();
  const [post, setPost] = useState<AdminPostDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(postId));
  const [busy, setBusy] = useState(false);
  const [savedMarkdown, setSavedMarkdown] = useState("");
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [scheduleValue, setScheduleValue] = useState("");
  const [recovery, setRecovery] = useState<ReturnType<typeof loadEditorDraft>>(null);
  const form = useForm<PostEditorValues>({ resolver: zodResolver(postEditorSchema), defaultValues: EMPTY_POST_VALUES });
  const values = form.watch();
  const fingerprint = useMemo(() => JSON.stringify(values), [values]);
  const storageKey = draftStorageKey(postId ?? "new");
  const conflict = usePostConflict();
  const readiness = usePostReadiness(postId, post?.version);

  useEffect(() => {
    if (!postId) { setRecovery(loadEditorDraft(storageKey)); return; }
    void clientApiRequest<AdminPostDetail>(`/blog/posts/${postId}`).then((result) => {
      setPost(result.data); const initial = valuesFromPost(result.data); form.reset(initial); setSavedMarkdown(initial.content);
      if (result.data.scheduledAt) setScheduleValue(utcToDatetimeLocal(result.data.scheduledAt as unknown as string));
      const local = loadEditorDraft(storageKey);
      if (local && local.timestamp > new Date(result.data.updatedAt ?? 0).getTime()) setRecovery(local);
    }).catch(() => toast.error("تعذر تحميل المقال")).finally(() => setLoading(false));
  }, [form, postId, storageKey]);

  useEffect(() => {
    if (!form.formState.isDirty) return;
    const timer = window.setTimeout(() => saveEditorDraft(storageKey, { timestamp: Date.now(), version: post?.version ?? 0, values }), 500);
    return () => window.clearTimeout(timer);
  }, [fingerprint, form.formState.isDirty, post?.version, storageKey, values]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => { if (form.formState.isDirty) event.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [form.formState.isDirty]);

  const save = useCallback(async (reason: "manual_save" | "autosave") => {
    const current = form.getValues();
    const draftValidation = postDraftPersistenceSchema.safeParse(current);
    if (!draftValidation.success) {
      if (reason === "manual_save") toast.error("توجد بيانات غير صالحة للحفظ");
      throw new Error("draft_validation");
    }
    setBusy(true);
    try {
      const result = post
        ? await clientApiRequest<AdminPostDetail>(`/blog/posts/${post.id ?? post._id}${reason === "autosave" ? "/autosave" : ""}`, { method: reason === "autosave" ? "POST" : "PUT", body: { ...editablePayload(current), expectedVersion: post.version, saveReason: reason } })
        : await clientApiRequest<AdminPostDetail>("/blog/posts", { method: "POST", body: editablePayload(current) });
      setPost(result.data); setSavedMarkdown(current.content); form.reset(valuesFromPost(result.data)); clearEditorDraft(storageKey);
      if (!post) router.replace(`/admin/blog/posts/${result.data.id ?? result.data._id}/edit`);
      if (reason === "manual_save") toast.success("تم حفظ المقال");
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 409 && postId) {
        const server = await clientApiRequest<AdminPostDetail>(`/blog/posts/${postId}`);
        conflict.openConflict(server.data, current.content);
      }
      throw error;
    } finally { setBusy(false); }
  }, [conflict, form, post, postId, router, storageKey]);

  const autosave = usePostAutosave({ enabled: Boolean(post && form.formState.isDirty && !conflict.serverPost), fingerprint, save: () => save("autosave") });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); void save("manual_save").then(autosave.markSaved).catch(() => undefined); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [save]);

  const action = async (name: string, payload?: any) => {
    if (!post) return;
    setBusy(true);
    try {
      if (name === "publish" || name === "schedule") {
        const checked = await readiness.refresh();
        if (!checked?.ready) { toast.error("عالج موانع النشر أولاً"); return; }
        if (checked.warnings.length && !window.confirm(`يوجد ${checked.warnings.length} تحذيرات. هل تريد المتابعة؟`)) return;
      }
      let body: any = { expectedVersion: post.version };
      if (name === "schedule") {
        body = { expectedVersion: post.version, scheduledAt: datetimeLocalToUtc(scheduleValue), sourceTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
      }
      if (payload) {
        body = { ...body, ...payload };
      }
      const result = await clientApiRequest<AdminPostDetail>(`/blog/posts/${post.id ?? post._id}/${name}`, { method: "POST", body });
      setPost(result.data); form.reset(valuesFromPost(result.data));
      if (result.data.scheduledAt) setScheduleValue(utcToDatetimeLocal(result.data.scheduledAt as unknown as string));
      toast.success(result.message);
    } catch (error) { toast.error(error instanceof Error ? error.message : "فشل الإجراء"); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">جارٍ تحميل المحرر…</div>;
  return <div className="space-y-5 pb-16" dir="rtl"><nav className="text-xs text-muted-foreground"><Link href="/admin/blog/posts">المقالات</Link><span className="mx-2">/</span><span>{post ? "تحرير" : "مقال جديد"}</span></nav><header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 py-3 backdrop-blur"><div><h1 className="text-2xl font-bold">{post ? `تحرير: ${post.title}` : "إنشاء مقال جديد"}</h1><p className="text-xs text-muted-foreground">الحالة: {post?.status ?? "مسودة جديدة"} · الإصدار {post?.version ?? 0}</p></div><div className="flex gap-2">{post ? <Link href={`/admin/blog/posts/${post.id ?? post._id}/preview`} target="_blank" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"><Eye className="h-4 w-4" />معاينة</Link> : null}<button type="button" disabled={busy} onClick={() => void save("manual_save").then(autosave.markSaved).catch(() => toast.error("تعذر حفظ المقال"))} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"><Save className="h-4 w-4" />حفظ</button></div></header>{recovery ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm"><span>توجد نسخة محلية أحدث من نسخة الخادم.</span><div className="flex gap-2"><button onClick={() => { form.reset(recovery.values); setRecovery(null); }} className="rounded border border-border px-3 py-1">استعادة</button><button onClick={() => { clearEditorDraft(storageKey); setRecovery(null); }} className="rounded border border-border px-3 py-1">تجاهل</button></div></div> : null}<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><main className="min-w-0 space-y-5"><PostBasicsPanel form={form} /><div className="premium-card overflow-hidden"><div className="flex gap-2 border-b border-border p-3"><button type="button" onClick={() => setTab("edit")} className={`rounded px-3 py-1 text-sm ${tab === "edit" ? "bg-primary text-primary-foreground" : ""}`}>تحرير / Source / Diff</button><button type="button" onClick={() => setTab("preview")} className={`rounded px-3 py-1 text-sm ${tab === "preview" ? "bg-primary text-primary-foreground" : ""}`}>معاينة</button></div>{tab === "edit" ? <BlogMarkdownEditor markdown={values.content} savedMarkdown={savedMarkdown} onChange={(content) => form.setValue("content", content, { shouldDirty: true, shouldValidate: true })} /> : <EditorPreview content={values.content} />}<EditorStatusBar state={autosave.state} savedAt={autosave.savedAt} content={values.content} /></div></main><aside className="space-y-4 xl:sticky xl:top-24 xl:self-start"><PostPublishingPanel post={post} scheduleValue={scheduleValue} onScheduleValue={setScheduleValue} busy={busy} onAction={(name, payload) => void action(name, payload)} /><PostTaxonomyPanel form={form} /><PostMediaPanel form={form} /><section className="premium-card p-4"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" {...form.register("isFeatured")} />مقال مميز</label>{values.isFeatured ? <label className="mt-3 block text-xs font-bold">ترتيب الظهور<input type="number" {...form.register("featuredOrder", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border border-border bg-background p-2" /></label> : null}</section><PostRelatedPanel form={form} /><PostSeoPanel form={form} /><PostReadinessPanel result={readiness.result} loading={readiness.loading} onRefresh={() => void readiness.refresh()} />{post ? <Link href={`/admin/blog/posts/${post.id ?? post._id}/revisions`} className="block rounded-xl border border-border p-4 text-center text-sm font-bold">سجل الإصدارات</Link> : null}</aside></div>{conflict.serverPost ? <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4"><div className="w-full max-w-3xl rounded-xl border border-border bg-card p-5"><h2 className="text-xl font-bold text-danger">تعارض نسخة</h2><p className="mt-2 text-sm text-muted-foreground">عُدّل المقال من جلسة أخرى. لن تتم الكتابة فوقه تلقائيًا.</p><div className="mt-4 grid gap-3 md:grid-cols-2"><textarea readOnly value={conflict.localContent} rows={12} className="rounded border border-border bg-background p-3 text-xs" /><textarea readOnly value={conflict.serverPost.content} rows={12} className="rounded border border-border bg-background p-3 text-xs" /></div><div className="mt-4 flex flex-wrap justify-end gap-2"><button onClick={() => navigator.clipboard.writeText(conflict.localContent)} className="rounded border border-border px-3 py-2 text-sm">نسخ المحتوى المحلي</button><button onClick={() => { form.reset(valuesFromPost(conflict.serverPost!)); setPost(conflict.serverPost); conflict.closeConflict(); }} className="rounded bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">تحميل نسخة الخادم</button><button onClick={conflict.closeConflict} className="rounded border border-border px-3 py-2 text-sm">فتح Diff لاحقًا</button></div></div></div> : null}</div>;
}
