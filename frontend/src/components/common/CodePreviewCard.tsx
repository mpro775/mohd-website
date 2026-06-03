export function CodePreviewCard() {
  return (
    <div dir="ltr" className="overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-black/40">
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
        <span className="text-muted-foreground/40 select-none">UTF-8</span>
      </div>

      {/* Editor Content */}
      <pre className="overflow-x-auto p-5 text-left font-mono text-xs md:text-sm leading-6 md:leading-7 text-muted-foreground">
        <code>
          <span className="text-purple-400">const</span> <span className="text-sky-300">engineer</span> = &#123;{"\n"}
          {"  "}<span className="text-amber-200/90">focus</span>: <span className="text-emerald-400">"Full-Stack Web & Apps"</span>,{"\n"}
          {"  "}<span className="text-amber-200/90">stack</span>: [
          <span className="text-emerald-400">"Next.js"</span>,{" "}
          <span className="text-emerald-400">"NestJS"</span>,{" "}
          <span className="text-emerald-400">"PostgreSQL"</span>
          ],{"\n"}
          {"  "}<span className="text-amber-200/90">ships</span>: <span className="text-emerald-400">"clean, high-performance code"</span>,{"\n"}
          {"  "}<span className="text-amber-200/90">readyToBuild</span>: <span className="text-purple-400">true</span>{"\n"}
          &#125;;
        </code>
      </pre>
    </div>
  );
}
