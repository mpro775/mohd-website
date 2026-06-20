import Image from "next/image";
import Link from "next/link";
import { Code2, ExternalLink, FileText } from "lucide-react";
import { LinkButton } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TechStackBadge } from "@/components/common/TechStackBadge";
import { itemId } from "@/lib/api/client";
import type { Project } from "@/lib/api/types";

function fallbackImage(project: Project) {
  const category = `${project.category ?? ""} ${project.title}`.toLowerCase();
  if (category.includes("mobile")) return "/projects/fallback-mobile.svg";
  if (category.includes("dashboard") || category.includes("admin")) return "/projects/fallback-dashboard.svg";
  if (category.includes("api") || category.includes("backend")) return "/projects/fallback-api.svg";
  return "/projects/fallback-web.svg";
}

export function ProjectCard({ project }: { project: Project }) {
  const image = project.coverImage ?? project.images?.[0] ?? fallbackImage(project);

  return (
    <article className="premium-card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40">
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={image}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
          <span className="absolute right-3 top-3 rounded-full border border-primary/30 bg-background/80 px-3 py-1 font-mono text-[10px] font-semibold text-primary backdrop-blur">
            Case Study
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-primary/90">{project.category ?? "Product build"}</p>
          <StatusBadge value={project.status} />
        </div>

        <Link href={`/projects/${project.slug}`} className="text-xl font-bold text-foreground transition hover:text-primary">
          {project.title}
        </Link>
        <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{project.shortDescription}</p>

        {project.problem ? (
          <div className="rounded-lg border border-border/70 bg-background/50 p-3">
            <p className="text-[11px] font-semibold text-muted-foreground">المشكلة</p>
            <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted-foreground">{project.problem}</p>
          </div>
        ) : null}

        {project.results ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-[11px] font-semibold text-primary">النتيجة</p>
            <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted-foreground">{project.results}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {project.technologies?.slice(0, 5).map((tech) => (
            <TechStackBadge key={`${itemId(project)}-${tech}`} name={tech} />
          ))}
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <LinkButton href={`/projects/${project.slug}`} variant="secondary" size="sm" className="flex-1 gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            التفاصيل
          </LinkButton>
          {project.liveUrl ? (
            <LinkButton href={project.liveUrl} target="_blank" rel="noreferrer" size="sm" className="gap-1.5" dir="ltr">
              <ExternalLink className="h-3.5 w-3.5" /> Live
            </LinkButton>
          ) : null}
          {project.githubUrl ? (
            <LinkButton href={project.githubUrl} target="_blank" rel="noreferrer" variant="terminal" size="sm" className="gap-1.5" dir="ltr">
              <Code2 className="h-3.5 w-3.5" /> GitHub
            </LinkButton>
          ) : null}
        </div>
      </div>
    </article>
  );
}
