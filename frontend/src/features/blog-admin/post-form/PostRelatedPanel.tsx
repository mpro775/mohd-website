"use client";

import type { UseFormReturn } from "react-hook-form";
import type { PostEditorValues } from "../schemas/post-editor.schema";
import { AsyncPostMultiSelect } from "./AsyncPostMultiSelect";

export function PostRelatedPanel({ form, postId }: { form: UseFormReturn<PostEditorValues>; postId?: string }) {
  return (
    <details className="premium-card p-4">
      <summary className="cursor-pointer font-bold">المقالات ذات الصلة</summary>
      <p className="mt-2 mb-4 text-xs text-muted-foreground">
        اختر المقالات ذات الصلة يدوياً، وسيكمل النظام الباقي خوارزمياً. يمكنك تغيير الترتيب بالسحب.
      </p>
      <AsyncPostMultiSelect
        value={form.watch("relatedPostIds")}
        excludePostId={postId}
        maxItems={6}
        onChange={(ids) =>
          form.setValue("relatedPostIds", ids, {
            shouldDirty: true,
          })
        }
      />
    </details>
  );
}
