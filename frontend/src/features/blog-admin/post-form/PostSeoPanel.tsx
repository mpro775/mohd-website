"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { MediaField } from "@/components/admin/forms/MediaField";
import type { PostEditorValues } from "../schemas/post-editor.schema";

export function PostSeoPanel({ form }: { form: UseFormReturn<PostEditorValues> }) {
  return <details className="premium-card p-4"><summary className="cursor-pointer font-bold">تحسين محركات البحث</summary><div className="mt-4 space-y-3"><label className="block text-xs font-bold">عنوان SEO<input {...form.register("seo.metaTitle")} className="mt-1 w-full rounded-lg border border-border bg-background p-2" /></label><label className="block text-xs font-bold">وصف SEO<textarea {...form.register("seo.metaDescription")} rows={3} className="mt-1 w-full rounded-lg border border-border bg-background p-2" /></label><label className="block text-xs font-bold">Canonical URL<input {...form.register("canonicalUrl")} dir="ltr" className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-left" /></label><Controller control={form.control} name="seo.ogImageMediaId" render={({ field }) => <MediaField label="صورة Open Graph" allowedType="image" defaultFolder="blog" valueId={field.value} valueUrl={form.watch("seo.ogImage")} onChange={field.onChange} />} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("allowIndexing")} />السماح بالفهرسة</label></div></details>;
}
