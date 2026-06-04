import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 max-w-3xl", className)}>
      {eyebrow ? (
        <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-primary">
          <span dir="ltr" className="inline-flex items-center gap-1.5">
            <span>{"//"}</span>
            <span>{eyebrow}</span>
          </span>
        </p>
      ) : null}
      <h2 className="text-2xl font-bold tracking-normal text-foreground md:text-3xl">{title}</h2>
      {description ? <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">{description}</p> : null}
    </div>
  );
}
