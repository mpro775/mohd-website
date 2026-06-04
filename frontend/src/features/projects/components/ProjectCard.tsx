import Image from "next/image";
import Link from "next/link";
import { Code2, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/api/types";
import { itemId } from "@/lib/api/client";
import { TechStackBadge } from "@/components/common/TechStackBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { LinkButton } from "@/components/common/Button";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_16px_48px_-16px_rgba(55,211,153,0.15)] flex flex-col h-full justify-between">
      <div>
        <Link href={`/projects/${project.slug}`} className="block">
          <div className="relative aspect-video overflow-hidden bg-muted">
            {project.coverImage ? (
              <>
                <Image 
                  src={project.coverImage} 
                  alt={project.title} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                {/* Shimmer overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer" />
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary rounded-full border border-primary/30 bg-background/80 backdrop-blur-sm px-3 py-1.5" dir="ltr">
                    {"// View Case Study "} &rarr;
                  </span>
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col justify-between bg-gradient-to-br from-[#071019] to-card p-4 font-mono text-[10px] text-muted-foreground/60 transition-colors duration-300 group-hover:text-primary/80 border-b border-border/40 select-none">
                <div className="flex items-center justify-between border-b border-border/20 pb-1.5">
                  <span>projects/[slug].tsx</span>
                  <span className="h-2 w-2 rounded-full bg-primary/40" />
                </div>
                <div className="space-y-1.5 py-4 text-left font-mono" dir="ltr">
                  <p><span className="text-primary/80">const</span> project = <span className="text-secondary">&quot;{project.slug}&quot;</span>;</p>
                  <p><span className="text-primary/80">status</span>: <span className="text-warning">&quot;{project.status || 'completed'}&quot;</span>;</p>
                  <p><span className="text-primary/80">stack</span>: [<span className="text-secondary">{project.technologies?.slice(0, 3).map(t => `"${t}"`).join(', ') || '"Next.js"'}</span>];</p>
                </div>
                <div className="border-t border-border/20 pt-1 text-left text-[9px]">
                  {"// Click to view case study"}
                </div>
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
          
          {project.results ? (
            <p className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs leading-6 text-muted-foreground">
              النتيجة: {project.results}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {project.technologies?.slice(0, 5).map((tech) => (
              <TechStackBadge key={`${itemId(project)}-${tech}`} name={tech} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 p-5 pt-0">
        {project.githubUrl ? (
          <LinkButton 
            href={project.githubUrl} 
            target="_blank" 
            rel="noreferrer" 
            variant="terminal" 
            size="sm"
            className="flex-1 gap-1.5"
            dir="ltr"
          >
            <Code2 className="h-3.5 w-3.5" /> GitHub
          </LinkButton>
        ) : null}
        {project.liveUrl ? (
          <LinkButton 
            href={project.liveUrl} 
            target="_blank" 
            rel="noreferrer" 
            variant="primary" 
            size="sm"
            className="flex-1 gap-1.5"
            dir="ltr"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Live
          </LinkButton>
        ) : null}
      </div>
    </article>
  );
}
