import Image from "next/image";
import { Code2, ExternalLink } from "lucide-react";
import { LinkButton } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Project } from "@/lib/api/types";

function heroImage(project: Project) {
  return project.coverImage ?? project.images?.[0] ?? "/projects/fallback-web.svg";
}

export function ProjectHeroShowcase({ project }: { project: Project }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-muted/10 py-12 tech-grid">
      <div className="ambient-glow -left-20 top-0 opacity-30" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="relative z-10 flex flex-col justify-center">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusBadge value={project.status} />
            {project.category ? <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{project.category}</span> : null}
            {project.completionDate ? <span dir="ltr" className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">{project.completionDate}</span> : null}
          </div>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">{project.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">{project.shortDescription}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {project.liveUrl ? (
              <LinkButton href={project.liveUrl} target="_blank" rel="noreferrer" className="gap-2" dir="ltr">
                <ExternalLink className="h-4 w-4" /> Live
              </LinkButton>
            ) : null}
            {project.githubUrl ? (
              <LinkButton href={project.githubUrl} target="_blank" rel="noreferrer" variant="terminal" className="gap-2" dir="ltr">
                <Code2 className="h-4 w-4" /> GitHub
              </LinkButton>
            ) : null}
          </div>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted shadow-2xl">
          <Image src={heroImage(project)} alt={project.title} fill priority className="object-cover" />
        </div>
      </div>
    </section>
  );
}
