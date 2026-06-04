export function TechStackBadge({ name }: { name: string }) {
  return (
    <span
      dir="ltr"
      className="inline-flex rounded-full border border-border bg-muted px-2.5 py-0.5 font-mono text-xs text-muted-foreground transition hover:border-primary/40 hover:text-primary"
    >
      {name}
    </span>
  );
}
