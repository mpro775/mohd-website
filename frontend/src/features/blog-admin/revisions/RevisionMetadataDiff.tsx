"use client";

import { PostRevisionSnapshot } from "@/lib/api/types";

interface RevisionMetadataDiffProps {
  base: Partial<PostRevisionSnapshot>;
  target: Partial<PostRevisionSnapshot>;
}

export function RevisionMetadataDiff({ base, target }: RevisionMetadataDiffProps) {
  const fields = [
    { key: 'title', label: 'العنوان', getValue: (s: Partial<PostRevisionSnapshot>) => s.title || '—' },
    { key: 'summary', label: 'الملخص', getValue: (s: Partial<PostRevisionSnapshot>) => s.summary || '—' },
    { key: 'category', label: 'التصنيف', getValue: (s: Partial<PostRevisionSnapshot>) => {
      if (typeof s.category === 'object' && s.category !== null) return (s.category as any).name || '—';
      return s.category || '—';
    }},
    { key: 'tags', label: 'الوسوم', getValue: (s: Partial<PostRevisionSnapshot>) => {
      if (!s.tags || !Array.isArray(s.tags)) return '—';
      return s.tags.map((t: any) => typeof t === 'object' && t !== null ? t.name : t).join('، ') || '—';
    }},
    { key: 'canonicalUrl', label: 'Canonical', getValue: (s: Partial<PostRevisionSnapshot>) => s.canonicalUrl || '—' },
    { key: 'seo.metaTitle', label: 'SEO title', getValue: (s: Partial<PostRevisionSnapshot>) => s.seo?.metaTitle || '—' },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm text-right">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="p-3 font-bold border-b border-border">الحقل</th>
            <th className="p-3 font-bold border-r border-b border-border">الإصدار السابق</th>
            <th className="p-3 font-bold border-r border-b border-border">الإصدار الحالي</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {fields.map((field) => {
            const baseValue = field.getValue(base) as string;
            const targetValue = field.getValue(target) as string;
            const isChanged = baseValue !== targetValue;

            return (
              <tr key={field.key} className={isChanged ? "bg-primary/5" : ""}>
                <td className="p-3 font-bold">{field.label}</td>
                <td className={`p-3 border-r border-border ${isChanged ? 'text-red-500 line-through opacity-70' : ''}`}>{baseValue}</td>
                <td className={`p-3 border-r border-border ${isChanged ? 'text-green-600 font-bold' : ''}`}>{targetValue}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
