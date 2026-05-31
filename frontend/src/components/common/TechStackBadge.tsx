export function TechStackBadge({ name }: { name: string }) {
  return <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">{name}</span>;
}
