"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";
import { clientApiRequest } from "@/lib/api/admin-client";
import type { AdminPostDetail } from "@/lib/api/types";
import { usePostAutosave } from "../hooks/usePostAutosave";
import { usePostConflict } from "../hooks/usePostConflict";
import { usePostReadiness } from "../hooks/usePostReadiness";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";
import { EMPTY_POST_VALUES, postDraftPersistenceSchema, postEditorSchema, type PostEditorValues } from "../schemas/post-editor.schema";
import { clearEditorDraft, draftStorageKey, loadEditorDraft, saveEditorDraft } from "../utils/editor-draft-storage";
import { datetimeLocalToUtc, utcToDatetimeLocal } from "../utils/post-date";
import { BlogConflictDialog } from "../writing-studio/BlogConflictDialog";
import { BlogUnsavedChangesDialog } from "../writing-studio/BlogUnsavedChangesDialog";
import { BlogWritingStudio } from "../writing-studio/BlogWritingStudio";

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
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [savedMarkdown, setSavedMarkdown] = useState("");
  const [scheduleValue, setScheduleValue] = useState("");
  const [recovery, setRecovery] = useState<ReturnType<typeof loadEditorDraft>>(null);
  const form = useForm<PostEditorValues>({ resolver: zodResolver(postEditorSchema), defaultValues: EMPTY_POST_VALUES });
  // eslint-disable-next-line react-hooks/incompatible-library
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
    }).catch(() => { setLoadError(true); toast.error("تعذر تحميل المقال"); }).finally(() => setLoading(false));
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
  
  const shouldBlock = form.formState.isDirty && autosave.state !== "saved" && autosave.state !== "idle";
  const guard = useUnsavedChangesGuard(shouldBlock);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); void save("manual_save").then(autosave.markSaved).catch(() => undefined); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [save, autosave.markSaved]);

  const action = async (name: string, payload?: any) => {
    if (!post) return;
    setBusy(true);
    try {
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

  if (loading) return <div className="grid gap-6 py-8 xl:grid-cols-[1fr_340px]" dir="rtl"><div className="space-y-5"><div className="h-16 animate-pulse rounded-xl bg-muted" /><div className="mx-auto h-28 max-w-3xl animate-pulse rounded-xl bg-muted" /><div className="h-[560px] animate-pulse rounded-2xl bg-muted" /></div><div className="hidden h-[70vh] animate-pulse rounded-2xl bg-muted xl:block" /></div>;
  if (loadError) return <div className="mx-auto max-w-lg rounded-2xl border border-danger/30 bg-card p-8 text-center" dir="rtl"><AlertCircle className="mx-auto h-9 w-9 text-danger" /><h1 className="mt-3 text-xl font-bold">تعذر تحميل المقال</h1><p className="mt-2 text-sm text-muted-foreground">تحقق من الاتصال ثم أعد المحاولة.</p><div className="mt-5 flex justify-center gap-2"><button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">إعادة المحاولة</button><button type="button" onClick={() => router.push("/admin/blog/posts")} className="rounded-lg border border-border px-4 py-2 text-sm font-bold">العودة للمقالات</button></div></div>;
  return (
    <>
      {recovery ? <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm" dir="rtl"><span>توجد نسخة محلية أحدث من نسخة الخادم.</span><div className="flex gap-2"><button type="button" onClick={() => { form.reset(recovery.values); setRecovery(null); }} className="rounded border border-border px-3 py-1">استعادة</button><button type="button" onClick={() => { clearEditorDraft(storageKey); setRecovery(null); }} className="rounded border border-border px-3 py-1">تجاهل</button></div></div> : null}
      <BlogWritingStudio
        form={form}
        post={post}
        busy={busy}
        savedMarkdown={savedMarkdown}
        autosaveState={autosave.state}
        savedAt={autosave.savedAt}
        scheduleValue={scheduleValue}
        readiness={readiness}
        onScheduleValue={setScheduleValue}
        onSave={async () => {
          try {
            await save("manual_save");
            autosave.markSaved();
          } catch {
            toast.error("تعذر حفظ المقال");
          }
        }}
        onAction={action}
      />
      <BlogConflictDialog
        serverPost={conflict.serverPost}
        localContent={conflict.localContent}
        onClose={conflict.closeConflict}
        onLoadServer={() => {
          if (!conflict.serverPost) return;
          form.reset(valuesFromPost(conflict.serverPost));
          setPost(conflict.serverPost);
          conflict.closeConflict();
        }}
      />
      <BlogUnsavedChangesDialog
        open={guard.dialogOpen}
        onSaveAndLeave={() => { void save("manual_save").then(() => guard.confirmNavigation()).catch(() => undefined); }}
        onLeave={guard.confirmNavigation}
        onStay={guard.cancelNavigation}
      />
    </>
  );
}
