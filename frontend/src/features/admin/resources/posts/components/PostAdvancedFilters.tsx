"use client";

import * as Popover from "@radix-ui/react-popover";
import { SlidersHorizontal } from "lucide-react";

export type AdvancedFilterValues = {
  isFeatured: string;
  hasWarnings: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: string;
};

export function PostAdvancedFilters({
  values,
  onChange,
}: {
  values: AdvancedFilterValues;
  onChange: (patch: Partial<AdvancedFilterValues>) => void;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild><button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-bold"><SlidersHorizontal className="h-4 w-4" /> فلاتر</button></Popover.Trigger>
      <Popover.Portal>
        <Popover.Content dir="rtl" align="end" sideOffset={8} className="z-50 w-[min(92vw,360px)] rounded-2xl border border-border bg-card p-4 shadow-2xl">
          <h3 className="font-bold">فلاتر متقدمة</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold">التمييز<select value={values.isFeatured} onChange={(event) => onChange({ isFeatured: event.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background p-2"><option value="all">الكل</option><option value="true">مميز فقط</option><option value="false">غير مميز</option></select></label>
            <label className="text-xs font-bold">الجودة<select value={values.hasWarnings} onChange={(event) => onChange({ hasWarnings: event.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background p-2"><option value="all">الكل</option><option value="true">تحتاج انتباه</option></select></label>
            <label className="text-xs font-bold">من تاريخ<input type="date" value={values.dateFrom} onChange={(event) => onChange({ dateFrom: event.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background p-2" /></label>
            <label className="text-xs font-bold">إلى تاريخ<input type="date" value={values.dateTo} onChange={(event) => onChange({ dateTo: event.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background p-2" /></label>
            <label className="text-xs font-bold">الترتيب<select value={values.sortBy} onChange={(event) => onChange({ sortBy: event.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background p-2"><option value="updatedAt">آخر تعديل</option><option value="publishedAt">تاريخ النشر</option><option value="title">العنوان</option><option value="viewCount">المشاهدات</option><option value="readTime">وقت القراءة</option></select></label>
            <label className="text-xs font-bold">الاتجاه<select value={values.sortOrder} onChange={(event) => onChange({ sortOrder: event.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background p-2"><option value="desc">الأحدث أولًا</option><option value="asc">الأقدم أولًا</option></select></label>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
