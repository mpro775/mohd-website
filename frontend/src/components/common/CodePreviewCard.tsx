export function CodePreviewCard() {
  const lineNumbers = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div dir="ltr" className="group overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-black/40 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_20px_60px_-20px_rgba(55,211,153,0.12)]">
      {/* IDE Tab Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-background/50 px-4 py-2 text-xs">
        <div className="flex gap-2">
          {/* Active Tab */}
          <div className="flex items-center gap-1.5 rounded bg-card px-2.5 py-1 text-foreground border-t-2 border-primary">
            <span className="text-[10px] font-bold text-blue-400">TS</span>
            <span>developer.ts</span>
          </div>
          {/* Inactive Tab */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-muted-foreground/60 hover:text-muted-foreground transition cursor-pointer">
            <span className="text-[10px] font-bold text-yellow-500">JS</span>
            <span>stack.config.js</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
          <span className="text-muted-foreground/40 select-none">UTF-8</span>
        </div>
      </div>

      {/* Editor Content with line numbers */}
      <div className="flex">
        {/* Line numbers gutter */}
        <div className="flex flex-col items-end px-3 py-5 text-xs font-mono text-muted-foreground/30 select-none border-r border-border/30 bg-background/20 leading-6 md:leading-7">
          {lineNumbers.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>

        {/* Code content */}
        <pre className="flex-1 overflow-x-auto p-5 text-left font-mono text-xs md:text-sm leading-6 md:leading-7 text-muted-foreground">
          <code>
            <span className="text-purple-400">const</span> <span className="text-sky-300">engineer</span> = &#123;{"\n"}
            {"  "}<span className="text-amber-200/90">focus</span>: <span className="text-emerald-400">&quot;Full-Stack Web &amp; Apps&quot;</span>,{"\n"}
            {"  "}<span className="text-amber-200/90">stack</span>: [
            <span className="text-emerald-400">&quot;Next.js&quot;</span>,{" "}
            <span className="text-emerald-400">&quot;NestJS&quot;</span>,{" "}
            <span className="text-emerald-400">&quot;PostgreSQL&quot;</span>
            ],{"\n"}
            {"  "}<span className="text-amber-200/90">ships</span>: <span className="text-emerald-400">&quot;clean, high-performance code&quot;</span>,{"\n"}
            {"  "}<span className="text-amber-200/90">readyToBuild</span>: <span className="text-purple-400">true</span>,{"\n"}
            {"  "}<span className="text-amber-200/90">passion</span>: <span className="text-emerald-400">&quot;∞&quot;</span>{"\n"}
            &#125;;
          </code>
        </pre>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-border/40 bg-background/30 px-4 py-1 text-[10px] font-mono text-muted-foreground/40 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            TypeScript
          </span>
          <span>Ln 7, Col 2</span>
        </div>
        <span>Spaces: 2</span>
      </div>
    </div>
  );
}
