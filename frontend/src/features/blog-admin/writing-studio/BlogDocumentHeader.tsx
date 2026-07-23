"use client";

import { useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { ImagePlus, Link2, RefreshCw } from "lucide-react";
import { MediaField } from "@/components/admin/forms/MediaField";
import type { PostEditorValues } from "../schemas/post-editor.schema";

export function slugFromTitle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function Counter({ value, max }: { value: string; max: number }) {
  const closeToLimit = value.length >= max * 0.8;
  return (
    <span className={`text-[11px] ${closeToLimit ? "text-amber-500" : "text-muted-foreground"}`}>
      {value.length.toLocaleString("ar-SA")} / {max.toLocaleString("ar-SA")}
    </span>
  );
}

export function BlogDocumentHeader({
  form,
}: {
  form: UseFormReturn<PostEditorValues>;
}) {
  const [editingSlug, setEditingSlug] = useState(false);
  const title = form.watch("title");
  const summary = form.watch("summary");
  const slug = form.watch("slug");
  const coverId = form.watch("coverImageMediaId");
  const coverUrl = form.watch("coverImage");

  return (
    <section className="mx-auto w-full max-w-[900px] space-y-5 px-1 py-5 md:px-6">
      <div>
        <label htmlFor="post-title" className="sr-only">عنوان المقال</label>
        <textarea
          id="post-title"
          {...form.register("title")}
          rows={2}
          dir="auto"
          placeholder="اكتب عنوان المقال"
          className="w-full resize-none rounded-xl border border-transparent bg-transparent px-3 py-2 text-3xl font-black leading-tight outline-none transition placeholder:text-muted-foreground/45 hover:bg-muted/20 focus:border-border focus:bg-card md:text-5xl"
          aria-describedby={form.formState.errors.title ? "post-title-error" : undefined}
        />
        <div className="flex justify-between px-3">
          {form.formState.errors.title ? (
            <p id="post-title-error" className="text-xs text-danger">
              {form.formState.errors.title.message}
            </p>
          ) : <span />}
          <Counter value={title} max={180} />
        </div>
      </div>

      <div>
        <label htmlFor="post-summary" className="sr-only">ملخص المقال</label>
        <textarea
          id="post-summary"
          {...form.register("summary")}
          rows={3}
          dir="auto"
          placeholder="اكتب ملخصًا واضحًا يساعد القارئ على فهم المقال..."
          className="w-full resize-y rounded-xl border border-transparent bg-transparent px-3 py-2 text-lg leading-8 text-muted-foreground outline-none transition hover:bg-muted/20 focus:border-border focus:bg-card"
        />
        <div className="flex justify-between px-3">
          {form.formState.errors.summary ? (
            <p className="text-xs text-danger">{form.formState.errors.summary.message}</p>
          ) : <span />}
          <Counter value={summary} max={500} />
        </div>
      </div>

      <div className="flex min-h-10 flex-wrap items-center gap-2 px-3 text-xs text-muted-foreground">
        <Link2 className="h-3.5 w-3.5" />
        {editingSlug ? (
          <>
            <span dir="ltr">/blog/</span>
            <input
              {...form.register("slug")}
              dir="ltr"
              autoFocus
              className="min-w-48 flex-1 rounded-lg border border-border bg-card px-2 py-1.5 text-left font-mono text-foreground"
              placeholder="article-slug"
            />
            <button
              type="button"
              onClick={() =>
                form.setValue("slug", slugFromTitle(title), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              توليد
            </button>
            <button type="button" onClick={() => setEditingSlug(false)} className="rounded-lg bg-primary px-3 py-1.5 font-bold text-primary-foreground">
              تم
            </button>
          </>
        ) : (
          <>
            <span className={slug ? "font-mono" : "text-amber-500"} dir="ltr">
              /blog/{slug || "أضف-رابطًا-دائمًا"}
            </span>
            <button type="button" onClick={() => setEditingSlug(true)} className="font-bold text-primary">
              تعديل
            </button>
          </>
        )}
      </div>

      <div id="post-cover-image" className="rounded-2xl border border-dashed border-border bg-card/45 p-3">
        <Controller
          control={form.control}
          name="coverImageMediaId"
          render={({ field }) => (
            <MediaField
              label="صورة الغلاف"
              allowedType="image"
              defaultFolder="blog"
              valueId={field.value}
              valueUrl={coverUrl}
              onChange={field.onChange}
            />
          )}
        />
        {coverId ? (
          <button
            type="button"
            onClick={() => {
              form.setValue("featuredImageMediaId", coverId, { shouldDirty: true });
              form.setValue("featuredImage", coverUrl, { shouldDirty: true });
            }}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-bold"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            استخدام كصورة بارزة
          </button>
        ) : null}
      </div>
    </section>
  );
}
