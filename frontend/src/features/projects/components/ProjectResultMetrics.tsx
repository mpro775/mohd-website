import type { Project } from "@/lib/api/types";

export function ProjectResultMetrics({ project }: { project: Project }) {
  const metrics = [
    project.status ? { label: "status", value: project.status } : null,
    project.category ? { label: "category", value: project.category } : null,
    project.technologies?.length ? { label: "stack_items", value: project.technologies.length } : null,
    project.views !== undefined ? { label: "views", value: project.views } : null,
  ].filter(Boolean) as { label: string; value: string | number }[];

  if (!metrics.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="glass-panel p-4">
          <p dir="ltr" className="font-mono text-xs text-muted-foreground">{metric.label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
