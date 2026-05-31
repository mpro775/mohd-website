export function CodePreviewCard() {
  return (
    <pre dir="ltr" className="overflow-hidden rounded-lg border border-border bg-card p-5 text-left font-mono text-sm leading-7 text-muted-foreground">
      <code>{`const engineer = {
  focus: "Full-Stack",
  stack: ["Next.js", "NestJS", "MongoDB"],
  ships: "clean, useful software"
};`}</code>
    </pre>
  );
}
