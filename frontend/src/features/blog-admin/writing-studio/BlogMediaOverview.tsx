"use client";

import type { UseFormReturn } from "react-hook-form";
import { Copy } from "lucide-react";
import type { PostEditorValues } from "../schemas/post-editor.schema";
import { PostMediaPanel } from "../post-form/PostMediaPanel";

export function BlogMediaOverview({
  form,
}: {
  form: UseFormReturn<PostEditorValues>;
}) {
  const coverId = form.watch("coverImageMediaId");
  const coverUrl = form.watch("coverImage");
  const featuredId = form.watch("featuredImageMediaId");
  const featuredUrl = form.watch("featuredImage");
  const copy = (
    idField: "coverImageMediaId" | "featuredImageMediaId" | "seo.ogImageMediaId",
    urlField: "coverImage" | "featuredImage" | "seo.ogImage",
    id: string | null | undefined,
    url: string | null | undefined,
  ) => {
    form.setValue(idField, id, { shouldDirty: true });
    form.setValue(urlField, url, { shouldDirty: true });
  };
  return (
    <div className="space-y-4">
      <PostMediaPanel form={form} />
      <div className="grid gap-2">
        {coverId ? (
          <>
            <button type="button" onClick={() => copy("featuredImageMediaId", "featuredImage", coverId, coverUrl)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-bold">
              <Copy className="h-3.5 w-3.5" /> استخدام الغلاف كصورة بارزة
            </button>
            <button type="button" onClick={() => copy("seo.ogImageMediaId", "seo.ogImage", coverId, coverUrl)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-bold">
              <Copy className="h-3.5 w-3.5" /> استخدام الغلاف كصورة Open Graph
            </button>
          </>
        ) : null}
        {featuredId ? (
          <>
            <button type="button" onClick={() => copy("coverImageMediaId", "coverImage", featuredId, featuredUrl)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-bold">
              <Copy className="h-3.5 w-3.5" /> استخدام الصورة البارزة كغلاف
            </button>
            <button type="button" onClick={() => copy("seo.ogImageMediaId", "seo.ogImage", featuredId, featuredUrl)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-bold">
              <Copy className="h-3.5 w-3.5" /> استخدام الصورة البارزة كصورة Open Graph
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
