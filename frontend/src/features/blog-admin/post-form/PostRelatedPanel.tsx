"use client";

import type { UseFormReturn } from "react-hook-form";
import type { PostEditorValues } from "../schemas/post-editor.schema";

export function PostRelatedPanel({ form }: { form: UseFormReturn<PostEditorValues> }) {
  const value = form.watch("relatedPostIds").join(", ");
  return <details className="premium-card p-4"><summary className="cursor-pointer font-bold">المقالات ذات الصلة</summary><p className="mt-2 text-xs text-muted-foreground">أدخل المعرّفات المطلوبة بالترتيب؛ سيكمل النظام الباقي خوارزميًا.</p><textarea value={value} onChange={(event) => form.setValue("relatedPostIds", event.target.value.split(",").map((item) => item.trim()).filter(Boolean), { shouldDirty: true })} rows={3} dir="ltr" className="mt-3 w-full rounded-lg border border-border bg-background p-2 text-left text-xs" /></details>;
}
