import type { Certification } from "@/lib/api/types";
import { EmptyState } from "@/components/common/State";
import { CertificationCard } from "./CertificationCard";

export function CertificationGrid({ items }: { items: Certification[] }) {
  if (!items.length) return <EmptyState title="لا توجد شهادات" description="لم نجد شهادات منشورة تطابق عوامل البحث الحالية." />;
  return <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((item) => <CertificationCard key={item.id ?? item.slug} certification={item} />)}</div>;
}
