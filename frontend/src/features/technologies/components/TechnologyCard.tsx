import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Technology } from "@/lib/api/types";

const meter = {
  beginner: "w-1/4",
  intermediate: "w-1/2",
  advanced: "w-3/4",
  expert: "w-full",
};

export function TechnologyCard({ technology }: { technology: Technology }) {
  const initials = technology.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 3);
  const level = technology.proficiencyLevel ?? "intermediate";

  return (
    <Link
      href={`/technologies/${technology.slug}`}
      className="premium-card group flex h-full flex-col justify-between p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
      style={technology.color ? { borderTop: `2px solid ${technology.color}` } : undefined}
    >
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <span dir="ltr" className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 font-mono text-sm font-bold text-primary">
            {technology.icon ?? initials}
          </span>
          {technology.highlighted ? (
            <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-[10px] text-primary">
              highlighted
            </span>
          ) : null}
        </div>
        <h3 dir="ltr" className="font-mono text-base font-bold text-foreground transition group-hover:text-primary">
          {technology.name}
        </h3>
        <p className="mt-3 line-clamp-3 text-xs leading-6 text-muted-foreground">{technology.description}</p>
      </div>

      <div className="mt-5 space-y-3 border-t border-border/30 pt-4">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge value={level} />
          <span dir="ltr" className="font-mono text-[10px] text-muted-foreground">
            {technology.yearsOfExperience ? `${technology.yearsOfExperience} yrs` : technology.category ?? technology.group ?? "stack"}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full bg-gradient-to-r from-primary to-secondary ${meter[level]}`} />
        </div>
        {technology.officialUrl ? (
          <span dir="ltr" className="inline-flex items-center gap-1 font-mono text-[10px] text-primary">
            docs <ExternalLink className="h-3 w-3" />
          </span>
        ) : null}
      </div>
    </Link>
  );
}
