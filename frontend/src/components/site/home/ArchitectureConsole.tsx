import { CheckCircle2, Database, GitBranch, Rocket, Server } from "lucide-react";

const nodes = [
  { label: "Frontend", icon: GitBranch, meta: "responsive" },
  { label: "API", icon: Server, meta: "stable" },
  { label: "Database", icon: Database, meta: "structured" },
  { label: "Deployment", icon: Rocket, meta: "production" },
];

export function ArchitectureConsole() {
  return (
    <div className="premium-card relative overflow-hidden p-4 md:p-5">
      <div className="noise-overlay" />
      <div className="relative z-10 mb-4 flex items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div dir="ltr" className="font-mono text-xs text-primary">
          engineering-os/main
        </div>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/80" />
        </div>
      </div>

      <div className="relative z-10 grid gap-3 sm:grid-cols-2">
        {nodes.map((node, index) => (
          <div key={node.label} className="glass-panel relative p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
                <node.icon className="h-4 w-4 text-primary" />
              </span>
              <div>
                <p dir="ltr" className="font-mono text-sm font-semibold text-foreground">
                  {node.label}
                </p>
                <p dir="ltr" className="font-mono text-[10px] text-muted-foreground">
                  {node.label.toLowerCase()}: {node.meta}
                </p>
              </div>
            </div>
            {index < nodes.length - 1 ? <span className="architecture-line" /> : null}
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-4 grid gap-3 md:grid-cols-[1fr_0.9fr]">
        <pre dir="ltr" className="overflow-hidden rounded-lg border border-border bg-[#071019] p-3 text-left font-mono text-[11px] leading-6 text-muted-foreground">
          <code>{`const product = build({
  ui: "clear",
  api: "typed",
  deploy: "ready"
});`}</code>
        </pre>
        <div dir="ltr" className="rounded-lg border border-border bg-background/70 p-3 font-mono text-[11px] leading-6 text-muted-foreground">
          <p className="text-primary">$ npm run build</p>
          <p>typecheck: passed</p>
          <p>lighthouse: focused</p>
          <p className="flex items-center gap-1.5 text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" /> production_status = stable
          </p>
        </div>
      </div>
    </div>
  );
}
