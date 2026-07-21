"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { MediaField } from "@/components/admin/forms/MediaField";
import type { PostEditorValues } from "../schemas/post-editor.schema";

export function PostMediaPanel({ form }: { form: UseFormReturn<PostEditorValues> }) {
  return <section className="premium-card space-y-4 p-4"><h2 className="font-bold">الصور</h2><Controller control={form.control} name="featuredImageMediaId" render={({ field }) => <MediaField label="الصورة البارزة" required allowedType="image" defaultFolder="blog" valueId={field.value} valueUrl={form.watch("featuredImage")} onChange={field.onChange} />} /><Controller control={form.control} name="coverImageMediaId" render={({ field }) => <MediaField label="صورة الغلاف" allowedType="image" defaultFolder="blog" valueId={field.value} valueUrl={form.watch("coverImage")} onChange={field.onChange} />} /></section>;
}
