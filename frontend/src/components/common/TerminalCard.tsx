export function TerminalCard({ lines }: { lines: string[] }) {
  return (
    <div dir="ltr" className="rounded-lg border border-border bg-[#071019] p-4 text-left font-mono text-sm shadow-2xl shadow-black/30">
      <div className="mb-4 flex gap-2">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
      </div>
      <div className="space-y-2">
        {lines.map((line) => (
          <p key={line} className="text-muted-foreground">
            <span className="text-primary">$</span> {line}
          </p>
        ))}
      </div>
    </div>
  );
}
