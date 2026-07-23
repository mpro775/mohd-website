"use client";

import { AlertTriangle, ListTree } from "lucide-react";

export type OutlineItem = { level: 2 | 3; title: string; duplicate: boolean };

export function extractMarkdownOutline(markdown: string): OutlineItem[] {
  let inFence = false;
  const raw: Array<{ level: 2 | 3; title: string }> = [];
  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(##|###)\s+(.+?)\s*#*\s*$/.exec(line);
    if (match) raw.push({ level: match[1].length as 2 | 3, title: match[2].trim() });
  }
  const counts = new Map<string, number>();
  raw.forEach((item) => counts.set(item.title, (counts.get(item.title) ?? 0) + 1));
  return raw.map((item) => ({ ...item, duplicate: (counts.get(item.title) ?? 0) > 1 }));
}

export function BlogOutlinePanel({ markdown }: { markdown: string }) {
  const items = extractMarkdownOutline(markdown);
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <h3 className="flex items-center gap-2 text-sm font-bold"><ListTree className="h-4 w-4" /> مخطط المقال</h3>
      {items.length ? (
        <ol className="mt-3 space-y-1">
          {items.map((item, index) => (
            <li key={`${item.title}-${index}`} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${item.level === 3 ? "mr-4 text-muted-foreground" : "font-bold"}`}>
              {item.duplicate ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500" aria-label="عنوان مكرر" /> : null}
              {item.title}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">أضف عناوين H2 أو H3 ليظهر مخطط المقال هنا.</p>
      )}
    </div>
  );
}
