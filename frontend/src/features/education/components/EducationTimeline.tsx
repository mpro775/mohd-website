import type { Education } from "@/lib/api/types";
import { EmptyState } from "@/components/common/State";
import { EducationCard } from "./EducationCard";

export function EducationTimeline({ items }: { items: Education[] }) {
  if (!items.length) return <EmptyState title="لا توجد مؤهلات" description="ستظهر المؤهلات الأكاديمية المنشورة هنا." />;
  return <ol className="relative space-y-5 border-r border-primary/25 pr-6">{items.map((item) => <li key={item.id ?? item.slug} className="relative before:absolute before:-right-[29px] before:top-7 before:h-3 before:w-3 before:rounded-full before:border-2 before:border-background before:bg-primary"><EducationCard education={item} /></li>)}</ol>;
}
