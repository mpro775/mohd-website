import Image from "next/image";
import Link from "next/link";
import { Code2, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/api/types";
import { itemId } from "@/lib/api/client";
import { TechStackBadge } from "@/components/common/TechStackBadge";
import { StatusBadge } from "@/components/common/StatusBadge";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_32px_-12px_rgba(55,211,153,0.12)]">
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {project.coverImage ? (
            <Image 
              src={project.coverImage} 
              alt={project.title} 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-card to-muted font-mono text-xs text-muted-foreground/60 transition-colors duration-300 group-hover:text-primary/80">
              case-study/{project.slug}
            </div>
          )}
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-primary/90">{project.category}</p>
          <StatusBadge value={project.status} />
        </div>
        <Link href={`/projects/${project.slug}`} className="block text-xl font-bold transition-colors duration-200 hover:text-primary group-hover:text-primary/95">
          {project.title}
        </Link>
        <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{project.shortDescription}</p>
        <div className="flex flex-wrap gap-2">
          {project.technologies?.slice(0, 5).map((tech) => <TechStackBadge key={`${itemId(project)}-${tech}`} name={tech} />)}
        </div>
        <div className="flex gap-4 pt-1 text-sm text-muted-foreground">
          {project.githubUrl ? (
            <Link href={project.githubUrl} target="_blank" className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-primary">
              <Code2 className="h-4 w-4" /> GitHub
            </Link>
          ) : null}
          {project.liveUrl ? (
            <Link href={project.liveUrl} target="_blank" className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-primary">
              <ExternalLink className="h-4 w-4" /> Live
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
