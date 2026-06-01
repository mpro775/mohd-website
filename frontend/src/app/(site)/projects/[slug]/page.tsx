import { notFound } from "next/navigation";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { TechStackBadge } from "@/components/common/TechStackBadge";
import { LinkButton } from "@/components/common/Button";
import { publicApi } from "@/lib/api/public";
import { projectJsonLd, breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await publicApi.project(slug).catch(() => null);
  if (!project) return {};
  return buildMetadata(project.title, project.shortDescription, project.seo, project.isPublished === false, `/projects/${slug}`);
}

export default async function ProjectDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await publicApi.project(slug).catch(() => null);
  if (!project) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd(project)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "الرئيسية", item: "/" },
              { name: "المشاريع", item: "/projects" },
              { name: project.title, item: `/projects/${slug}` }
            ])
          )
        }}
      />
      <PageHeader title={project.title} description={project.shortDescription} />
      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_320px]">
        <article className="space-y-8">
          {[
            ["المشكلة", project.problem],
            ["الحل", project.solution],
            ["النتائج", project.results],
            ["دوري", project.role],
          ].map(([title, value]) => value ? <section key={title} className="rounded-lg border border-border bg-card p-6"><h2 className="mb-3 text-xl font-bold">{title}</h2><p className="leading-8 text-muted-foreground">{value}</p></section> : null)}
          <MarkdownRenderer content={project.caseStudy ?? project.detailedDescription} />
        </article>
        <aside className="h-fit space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="flex flex-wrap gap-2">{project.technologies?.map((tech) => <TechStackBadge key={tech} name={tech} />)}</div>
          {project.githubUrl ? <LinkButton href={project.githubUrl} variant="secondary" className="w-full">GitHub</LinkButton> : null}
          {project.liveUrl ? <LinkButton href={project.liveUrl} className="w-full">Live Demo</LinkButton> : null}
        </aside>
      </Container>
    </>
  );
}
