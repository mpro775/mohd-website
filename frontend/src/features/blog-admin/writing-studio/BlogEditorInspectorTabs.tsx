"use client";

import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import type { UseFormReturn } from "react-hook-form";
import type { AdminPostDetail, ReadinessResult } from "@/lib/api/types";
import type { PostEditorValues } from "../schemas/post-editor.schema";
import { PostPublishingPanel } from "../post-form/PostPublishingPanel";
import { PostTaxonomyPanel } from "../post-form/PostTaxonomyPanel";
import { PostRelatedPanel } from "../post-form/PostRelatedPanel";
import { PostSeoPanel } from "../post-form/PostSeoPanel";
import { PostReadinessPanel } from "../post-form/PostReadinessPanel";
import { BlogMediaOverview } from "./BlogMediaOverview";
import { BlogOutlinePanel } from "./BlogOutlinePanel";
import { BlogSeoPreview } from "./BlogSeoPreview";
import type { BlogInspectorTab } from "./blog-writing-studio.types";

const tabs: Array<{ value: BlogInspectorTab; label: string }> = [
  { value: "publishing", label: "النشر" },
  { value: "organization", label: "التنظيم" },
  { value: "media", label: "الوسائط" },
  { value: "seo", label: "SEO" },
  { value: "quality", label: "الجودة" },
];

export function BlogEditorInspectorTabs({
  form,
  post,
  busy,
  scheduleValue,
  readiness,
  onAction,
  onRequestChanges,
  onArchive,
  onScheduleOpen,
}: {
  form: UseFormReturn<PostEditorValues>;
  post: AdminPostDetail | null;
  busy: boolean;
  scheduleValue: string;
  readiness: { result: ReadinessResult | null; loading: boolean; refresh: () => Promise<ReadinessResult | null> };
  onAction: (name: string, payload?: Record<string, unknown>) => Promise<void>;
  onRequestChanges: () => void;
  onArchive: () => void;
  onScheduleOpen: () => void;
}) {
  const [tab, setTab] = useState<BlogInspectorTab>("publishing");
  useEffect(() => {
    const saved = sessionStorage.getItem("blog-inspector-tab") as BlogInspectorTab | null;
    const timer = window.setTimeout(() => {
      if (saved && tabs.some((item) => item.value === saved)) setTab(saved);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const changeTab = (value: string) => {
    const next = value as BlogInspectorTab;
    setTab(next);
    sessionStorage.setItem("blog-inspector-tab", next);
  };
  const values = form.watch();
  return (
    <Tabs.Root value={tab} onValueChange={changeTab} dir="rtl">
      <Tabs.List className="flex max-w-full gap-1 overflow-x-auto border-b border-border p-2" aria-label="خصائص المقال">
        {tabs.map((item) => (
          <Tabs.Trigger key={item.value} value={item.value} className="shrink-0 rounded-lg px-2.5 py-2 text-[11px] font-bold text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            {item.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-3">
        <Tabs.Content value="publishing">
          <PostPublishingPanel
            post={post}
            scheduleValue={scheduleValue}
            busy={busy}
            onAction={(name, payload) => void onAction(name, payload)}
            onRequestChanges={onRequestChanges}
            onArchive={onArchive}
            onScheduleOpen={onScheduleOpen}
          />
        </Tabs.Content>
        <Tabs.Content value="organization" className="space-y-4">
          <PostTaxonomyPanel form={form} />
          <section className="premium-card space-y-3 p-4">
            <label className="flex items-center justify-between gap-3 text-sm font-bold">
              <span>مقال مميز</span>
              <button type="button" role="switch" aria-checked={values.isFeatured} onClick={() => form.setValue("isFeatured", !values.isFeatured, { shouldDirty: true })} className={`relative h-6 w-11 rounded-full transition ${values.isFeatured ? "bg-primary" : "bg-muted"}`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${values.isFeatured ? "left-1" : "left-6"}`} />
              </button>
            </label>
            {values.isFeatured ? <label className="block text-xs font-bold">ترتيب الظهور<input type="number" {...form.register("featuredOrder", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border border-border bg-background p-2" /></label> : null}
            <label className="block text-xs font-bold">المقتطف<textarea id="post-excerpt" {...form.register("excerpt")} rows={3} className="mt-1 w-full rounded-lg border border-border bg-background p-2 font-normal" /></label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={values.excerpt === values.summary && Boolean(values.summary)} onChange={(event) => event.target.checked && form.setValue("excerpt", values.summary, { shouldDirty: true })} />استخدام الملخص كمقتطف</label>
          </section>
          <PostRelatedPanel form={form} postId={post?.id ?? post?._id} />
        </Tabs.Content>
        <Tabs.Content value="media"><BlogMediaOverview form={form} /></Tabs.Content>
        <Tabs.Content value="seo" className="space-y-4">
          <PostSeoPanel form={form} />
          <BlogSeoPreview
            title={values.seo.metaTitle || values.title}
            description={values.seo.metaDescription || values.summary}
            slug={values.slug ?? ""}
            image={values.seo.ogImage || values.featuredImage || values.coverImage}
          />
        </Tabs.Content>
        <Tabs.Content value="quality" className="space-y-4">
          <PostReadinessPanel result={readiness.result} loading={readiness.loading} onRefresh={() => void readiness.refresh()} />
          <BlogOutlinePanel markdown={values.content} />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}
