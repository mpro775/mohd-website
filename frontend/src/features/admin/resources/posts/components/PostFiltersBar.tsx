"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useTaxonomyOptions } from "@/features/blog-admin/hooks/useTaxonomyOptions";
import { PostActiveFilters } from "./PostActiveFilters";
import { PostAdvancedFilters, type AdvancedFilterValues } from "./PostAdvancedFilters";

export type PostFilterValues = AdvancedFilterValues & {
  search: string;
  category: string;
  author: string;
};

export function PostFiltersBar({
  values,
  onChange,
  onReset,
}: {
  values: PostFilterValues;
  onChange: (patch: Partial<PostFilterValues>) => void;
  onReset: () => void;
}) {
  const [search, setSearch] = useState(values.search);
  const { items: categories } = useTaxonomyOptions("category", "");
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(values.search), 0);
    return () => window.clearTimeout(timer);
  }, [values.search]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search !== values.search) onChange({ search });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [onChange, search, values.search]);

  const categoryName = categories.find((item) => item.id === values.category)?.name;
  const active = useMemo(() => {
    const items: Array<{ key: string; label: string }> = [];
    if (values.category) items.push({ key: "category", label: `التصنيف: ${categoryName ?? "تصنيف محدد"}` });
    if (values.author) items.push({ key: "author", label: "كاتب محدد" });
    if (values.isFeatured !== "all") items.push({ key: "isFeatured", label: values.isFeatured === "true" ? "مميز فقط" : "غير مميز" });
    if (values.hasWarnings === "true") items.push({ key: "hasWarnings", label: "تحتاج انتباه" });
    if (values.dateFrom) items.push({ key: "dateFrom", label: `من: ${values.dateFrom}` });
    if (values.dateTo) items.push({ key: "dateTo", label: `إلى: ${values.dateTo}` });
    return items;
  }, [categoryName, values]);

  const remove = (key: string) => {
    const defaults: Record<string, string> = {
      category: "",
      author: "",
      isFeatured: "all",
      hasWarnings: "all",
      dateFrom: "",
      dateTo: "",
    };
    onChange({ [key]: defaults[key] } as Partial<PostFilterValues>);
  };

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-3">
      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث في عنوان المقال أو محتواه…" className="h-10 w-full rounded-xl border border-border bg-background pr-9 pl-9 text-sm outline-none focus:border-primary" />
          {search ? <button type="button" onClick={() => setSearch("")} className="absolute left-3 top-3 text-muted-foreground" aria-label="مسح البحث"><X className="h-4 w-4" /></button> : null}
        </div>
        <select value={values.category} onChange={(event) => onChange({ category: event.target.value })} className="h-10 min-w-48 rounded-xl border border-border bg-background px-3 text-xs font-bold">
          <option value="">كل التصنيفات</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <PostAdvancedFilters values={values} onChange={onChange} />
        {active.length || values.search ? <button type="button" onClick={onReset} className="h-10 rounded-xl border border-border px-3 text-xs font-bold text-muted-foreground">مسح الكل</button> : null}
      </div>
      <PostActiveFilters items={active} onRemove={remove} />
    </section>
  );
}
