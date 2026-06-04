import { notFound } from "next/navigation";
import Image from "next/image";
import { Code2, ExternalLink } from "lucide-react";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { TechStackBadge } from "@/components/common/TechStackBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
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

  // Combine gallery and images arrays to build the media showcase
  const allImages = Array.from(
    new Set([...(project.gallery || []), ...(project.images || [])])
  ).filter((img) => img !== project.coverImage);

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
      <PageHeader 
        title={project.title} 
        description={project.shortDescription}
        eyebrow={project.category ?? "Case Study"}
        routeLabel={`~/projects/${project.slug}`}
      >
        <div className="flex items-center gap-2">
          <StatusBadge value={project.status} />
        </div>
      </PageHeader>

      {project.coverImage && (
        <Container className="mt-8">
          <div className="relative aspect-video md:aspect-[3/1] max-h-[400px] w-full overflow-hidden rounded-lg border border-border shadow-md">
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        </Container>
      )}

      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <article className="space-y-8">
            {[
              ["01 / المشكلة", project.problem],
              ["02 / الحل", project.solution],
              ["03 / النتيجة", project.results],
              ["04 / دوري في المشروع", project.role],
            ].map(([title, value]) => value ? (
              <section key={title} className="rounded-lg border border-border bg-card p-6 hover:border-primary/20 transition-all duration-200">
                <h2 className="mb-3 text-lg font-bold font-mono tracking-tight text-primary">{title}</h2>
                <p className="leading-8 text-muted-foreground text-sm">{value}</p>
              </section>
            ) : null)}
            
            {(project.caseStudy || project.detailedDescription) && (
              <section className="rounded-lg border border-border bg-card p-6 md:p-8">
                <h2 className="mb-6 text-xl font-bold font-mono tracking-tight flex items-center gap-1.5 justify-start">
                  <span>{"//"}</span>
                  <span>دراسة الحالة الكاملة</span>
                </h2>
                <div className="overflow-hidden">
                  <MarkdownRenderer content={project.caseStudy ?? project.detailedDescription} />
                </div>
              </section>
            )}
          </article>

          {/* Photo gallery grid */}
          {allImages.length > 0 && (
            <section className="space-y-4 rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-bold font-mono tracking-tight flex items-center gap-1.5 justify-start">
                <span>{"//"}</span>
                <span>معرض الصور</span>
              </h2>
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {allImages.slice(0, 4).map((img, idx) => (
                  <div key={img} className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                    <Image
                      src={img}
                      alt={`${project.title} - صورة معرض ${idx + 1}`}
                      fill
                      className="object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Aside metadata board */}
        <aside className="h-fit space-y-6 rounded-lg border border-border bg-card p-6">
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-semibold text-foreground uppercase border-b border-border/40 pb-2">{"// Project Meta"}</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">الحالة:</span>
                <StatusBadge value={project.status} />
              </div>
              
              {project.category && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">التصنيف:</span>
                  <span className="font-semibold text-foreground">{project.category}</span>
                </div>
              )}
              
              {project.completionDate && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">التاريخ:</span>
                  <span className="font-semibold text-foreground font-mono" dir="ltr">
                    {new Date(project.completionDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
                  </span>
                </div>
              )}

              {project.views !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">المشاهدات:</span>
                  <span className="font-semibold text-foreground font-mono">{project.views}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-mono text-xs font-semibold text-foreground uppercase border-b border-border/40 pb-2">{"// Tech Stack"}</h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.technologies?.map((tech) => (
                <TechStackBadge key={tech} name={tech} />
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {project.liveUrl && (
              <LinkButton href={project.liveUrl} target="_blank" rel="noreferrer" className="w-full justify-center gap-1.5" dir="ltr">
                <ExternalLink className="h-4 w-4" /> Live Demo
              </LinkButton>
            )}
            {project.githubUrl && (
              <LinkButton href={project.githubUrl} target="_blank" rel="noreferrer" variant="terminal" className="w-full justify-center gap-1.5" dir="ltr">
                <Code2 className="h-4 w-4" /> GitHub
              </LinkButton>
            )}
          </div>
        </aside>
      </Container>
    </>
  );
}
