"use client";

import { Globe2 } from "lucide-react";

export function BlogSeoPreview({
  title,
  description,
  slug,
  image,
}: {
  title: string;
  description: string;
  slug: string;
  image?: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs text-emerald-600" dir="ltr">
          mohd.site › blog › {slug || "article"}
        </p>
        <p className="mt-1 line-clamp-1 text-lg text-blue-500">{title || "عنوان المقال"}</p>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {description || "سيظهر وصف المقال هنا في نتيجة البحث."}
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        {image ? <img src={image} alt="" className="aspect-[1.91/1] w-full object-cover" /> : <div className="grid aspect-[1.91/1] place-items-center bg-muted"><Globe2 className="h-8 w-8 text-muted-foreground" /></div>}
        <div className="p-3">
          <p className="text-[10px] uppercase text-muted-foreground" dir="ltr">MOHD.SITE</p>
          <p className="mt-1 line-clamp-1 font-bold">{title || "عنوان المقال"}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{description || "وصف المشاركة الاجتماعية"}</p>
        </div>
      </div>
      {title.length > 70 || description.length > 180 ? (
        <p className="rounded-lg bg-amber-500/10 p-2 text-xs text-amber-500">
          قد يتم اقتطاع العنوان أو الوصف في نتائج البحث.
        </p>
      ) : null}
    </div>
  );
}
