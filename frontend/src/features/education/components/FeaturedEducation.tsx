import Link from "next/link";
import type { Education } from "@/lib/api/types";
import { SectionHeader } from "@/components/common/SectionHeader";
import { EducationTimeline } from "./EducationTimeline";

export function FeaturedEducation({ items }: { items: Education[] }) {
  if (!items.length) return null;
  return <section><div className="mb-7 flex items-end justify-between gap-4"><SectionHeader eyebrow="Education" title="المسار الأكاديمي" className="mb-0" /><Link href="/education" className="text-xs font-bold text-primary hover:underline">عرض المسار كاملًا</Link></div><EducationTimeline items={items} /></section>;
}
