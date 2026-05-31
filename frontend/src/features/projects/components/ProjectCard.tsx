import Image from "next/image";
import Link from "next/link";
import { Code2, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/api/types";
import { itemId } from "@/lib/api/client";
import { TechStackBadge } from "@/components/common/TechStackBadge";
import { StatusBadge } from "@/components/common/StatusBadge";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative aspect-video bg-muted">
          {project.coverImage ? (
            <Image src={project.coverImage} alt={project.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-muted-foreground">case-study/{project.slug}</div>
          )}
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-primary">{project.category}</p>
          <StatusBadge value={project.status} />
        </div>
        <Link href={`/projects/${project.slug}`} className="block text-xl font-bold hover:text-primary">
          {project.title}
        </Link>
        <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{project.shortDescription}</p>
        <div className="flex flex-wrap gap-2">
          {project.technologies?.slice(0, 5).map((tech) => <TechStackBadge key={`${itemId(project)}-${tech}`} name={tech} />)}
        </div>
        <div className="flex gap-3 text-sm text-muted-foreground">
          {project.githubUrl ? (
            <Link href={project.githubUrl} target="_blank" className="inline-flex items-center gap-1 hover:text-primary">
              <Code2 className="h-4 w-4" /> GitHub
            </Link>
          ) : null}
          {project.liveUrl ? (
            <Link href={project.liveUrl} target="_blank" className="inline-flex items-center gap-1 hover:text-primary">
              <ExternalLink className="h-4 w-4" /> Live
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
