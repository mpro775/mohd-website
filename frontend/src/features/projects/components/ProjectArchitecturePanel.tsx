export function ProjectArchitecturePanel() {
  const nodes = ["UI", "API", "Data", "Deploy"];
  return (
    <section className="premium-card p-6">
      <h2 className="mb-5 text-xl font-bold text-foreground">Architecture Panel</h2>
      <div className="grid gap-3 sm:grid-cols-4">
        {nodes.map((node, index) => (
          <div key={node} className="glass-panel relative p-4 text-center">
            <p dir="ltr" className="font-mono text-sm font-bold text-primary">{node}</p>
            <p className="mt-2 text-xs text-muted-foreground">طبقة واضحة ضمن المنتج</p>
            {index < nodes.length - 1 ? <span className="architecture-line" /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
