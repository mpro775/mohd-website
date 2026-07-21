"use client";

import { useEffect, useState } from "react";
import type { TocHeading } from "../utils/blog-markdown";

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [active, setActive] = useState(headings[0]?.id ?? "");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: [0, 1] },
    );
    for (const item of headings) {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [headings]);
  if (!headings.length) return <p className="text-sm text-muted-foreground">لا توجد عناوين داخلية.</p>;
  return <nav aria-label="جدول المحتويات"><ol className="space-y-2 text-sm">{headings.map((item) => <li key={item.id} className={item.level === 3 ? "pr-4" : ""}><a href={`#${item.id}`} className={active === item.id ? "font-bold text-primary" : "text-muted-foreground hover:text-foreground"}>{item.text}</a></li>)}</ol></nav>;
}
