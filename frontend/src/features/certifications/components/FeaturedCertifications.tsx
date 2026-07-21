import Link from "next/link";
import type { Certification } from "@/lib/api/types";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CertificationCard } from "./CertificationCard";

export function FeaturedCertifications({ items, title = "شهادات مميزة" }: { items: Certification[]; title?: string }) {
  if (!items.length) return null;
  return <section><div className="mb-7 flex items-end justify-between gap-4"><SectionHeader eyebrow="Credentials" title={title} className="mb-0" /><Link href="/certifications" className="text-xs font-bold text-primary hover:underline">عرض جميع الشهادات</Link></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((item) => <CertificationCard key={item.id ?? item.slug} certification={item} />)}</div></section>;
}
