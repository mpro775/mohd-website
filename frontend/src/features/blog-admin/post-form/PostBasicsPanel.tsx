"use client";

import type { UseFormReturn } from "react-hook-form";
import type { PostEditorValues } from "../schemas/post-editor.schema";

export function PostBasicsPanel({ form }: { form: UseFormReturn<PostEditorValues> }) {
  const { register, formState: { errors }, watch, setValue } = form;
  const slug = watch("slug");
  return <section className="premium-card space-y-4 p-5"><h2 className="text-lg font-bold">المحتوى الأساسي</h2><label className="block text-sm font-bold">العنوان<input {...register("title")} className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-xl font-bold" placeholder="عنوان المقال" /></label>{errors.title ? <p className="text-xs text-danger">{errors.title.message}</p> : null}<label className="block text-sm font-bold">الرابط الدائم<div className="mt-2 flex gap-2"><input {...register("slug")} dir="ltr" className="w-full rounded-lg border border-border bg-background p-2 text-left font-mono" placeholder="auto-generated-slug" /><button type="button" onClick={() => setValue("slug", watch("title").trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, ""), { shouldDirty: true })} className="rounded-lg border border-border px-3 text-xs">توليد</button></div>{slug ? <span className="mt-1 block text-xs text-muted-foreground" dir="ltr">/blog/{slug}</span> : null}</label><label className="block text-sm font-bold">الملخص<textarea {...register("summary")} rows={3} className="mt-2 w-full rounded-lg border border-border bg-background p-3" /></label>{errors.summary ? <p className="text-xs text-danger">{errors.summary.message}</p> : null}<label className="block text-sm font-bold">المقتطف (اختياري)<textarea {...register("excerpt")} rows={2} className="mt-2 w-full rounded-lg border border-border bg-background p-3" /></label></section>;
}
