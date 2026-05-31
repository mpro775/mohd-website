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
      {eyebrow ? <p className="mb-2 text-sm font-semibold text-primary">{eyebrow}</p> : null}
      <h2 className="text-2xl font-bold tracking-normal text-foreground md:text-3xl">{title}</h2>
      {description ? <p className="mt-3 leading-8 text-muted-foreground">{description}</p> : null}
    </div>
  );
}
