"use client";

import { X } from "lucide-react";

export type ActivePostFilter = { key: string; label: string };

export function PostActiveFilters({
  items,
  onRemove,
}: {
  items: ActivePostFilter[];
  onRemove: (key: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2" aria-label="الفلاتر النشطة">
      {items.map((item) => (
        <button key={item.key} type="button" onClick={() => onRemove(item.key)} className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary">
          {item.label}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}
