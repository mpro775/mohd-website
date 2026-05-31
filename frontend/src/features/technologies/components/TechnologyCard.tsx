import Link from "next/link";
import type { Technology } from "@/lib/api/types";
import { StatusBadge } from "@/components/common/StatusBadge";

export function TechnologyCard({ technology }: { technology: Technology }) {
  return (
    <Link href={`/technologies/${technology.slug}`} className="rounded-lg border border-border bg-card p-5 transition hover:border-primary/50">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">{technology.name}</h3>
        <StatusBadge value={technology.proficiencyLevel} />
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">{technology.description}</p>
      <p className="mt-4 text-xs text-primary">{technology.category ?? technology.group}</p>
    </Link>
  );
}
