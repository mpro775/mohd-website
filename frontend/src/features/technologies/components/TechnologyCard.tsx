import Link from "next/link";
import type { Technology } from "@/lib/api/types";
import { StatusBadge } from "@/components/common/StatusBadge";

export function TechnologyCard({ technology }: { technology: Technology }) {
  return (
    <Link 
      href={`/technologies/${technology.slug}`} 
      className="group relative rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_36px_-12px_rgba(55,211,153,0.18)] flex flex-col justify-between h-full overflow-hidden"
      style={technology.color ? { borderTop: `2px solid ${technology.color}` } : undefined}
    >
      {/* Subtle hover glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/0 transition-all duration-500 group-hover:bg-primary/[0.06] blur-2xl pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-3">
          <h3 className="font-mono text-base font-bold text-foreground transition-colors group-hover:text-primary" dir="ltr">
            {technology.name}
          </h3>
          <StatusBadge value={technology.proficiencyLevel} />
        </div>
        
        <p className="mt-3 line-clamp-3 text-xs leading-6 text-muted-foreground">
          {technology.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between gap-2 text-[10px] font-mono">
        <span className="text-primary/95 uppercase tracking-wider">
          {technology.category ?? technology.group ?? "stack"}
        </span>
        {technology.yearsOfExperience ? (
          <span className="text-muted-foreground/80 flex items-center gap-1">
            <span className="inline-block h-1 w-1 rounded-full bg-primary/50" />
            exp: {technology.yearsOfExperience} yrs
          </span>
        ) : null}
      </div>
    </Link>
  );
}
