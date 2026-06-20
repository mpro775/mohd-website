import { notFound } from "next/navigation";
import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { TechStackBadge } from "@/components/common/TechStackBadge";
import { ProjectArchitecturePanel } from "@/features/projects/components/ProjectArchitecturePanel";
import { ProjectGallery } from "@/features/projects/components/ProjectGallery";
import { ProjectHeroShowcase } from "@/features/projects/components/ProjectHeroShowcase";
import { ProjectResultMetrics } from "@/features/projects/components/ProjectResultMetrics";
import { publicApi } from "@/lib/api/public";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, projectJsonLd } from "@/lib/seo/structured-data";

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

  const gallery = Array.from(new Set([...(project.gallery || []), ...(project.images || [])])).filter((image) => image !== project.coverImage);

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
              { name: project.title, item: `/projects/${slug}` },
            ]),
          ),
        }}
      />

      <ProjectHeroShowcase project={project} />

      <Container className="space-y-8 py-12">
        <ProjectResultMetrics project={project} />

        <section className="premium-card p-6 md:p-8">
          <h2 className="mb-4 text-xl font-bold text-foreground">Overview</h2>
          <p className="whitespace-pre-line text-sm leading-8 text-muted-foreground">
            {project.detailedDescription ?? project.shortDescription}
          </p>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          {project.problem ? (
            <section className="premium-card p-6">
              <h2 className="mb-3 text-lg font-bold text-foreground">Challenge / Problem</h2>
              <p className="text-sm leading-8 text-muted-foreground">{project.problem}</p>
            </section>
          ) : null}
          {project.solution ? (
            <section className="premium-card p-6">
              <h2 className="mb-3 text-lg font-bold text-foreground">Solution</h2>
              <p className="text-sm leading-8 text-muted-foreground">{project.solution}</p>
            </section>
          ) : null}
        </div>

        <section className="premium-card p-6">
          <h2 className="mb-3 text-lg font-bold text-foreground">My Role</h2>
          <p className="text-sm leading-8 text-muted-foreground">
            {project.role ?? "ساهمت في تحويل المتطلبات إلى تجربة قابلة للاستخدام، مع التركيز على وضوح الواجهة، قابلية الصيانة، وجودة التنفيذ."}
          </p>
        </section>

        <ProjectArchitecturePanel />

        {project.technologies?.length ? (
          <section className="premium-card p-6">
            <h2 className="mb-4 text-xl font-bold text-foreground">Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <TechStackBadge key={tech} name={tech} />
              ))}
            </div>
          </section>
        ) : null}

        {project.results ? (
          <section className="premium-card border-primary/25 bg-primary/5 p-6">
            <h2 className="mb-3 text-xl font-bold text-foreground">Results</h2>
            <p className="text-sm leading-8 text-muted-foreground">{project.results}</p>
          </section>
        ) : null}

        {project.caseStudy ? (
          <section className="premium-card p-6 md:p-8">
            <h2 className="mb-6 text-xl font-bold text-foreground">Case Study</h2>
            <MarkdownRenderer content={project.caseStudy} />
          </section>
        ) : null}

        <ProjectGallery title={project.title} images={gallery} />

        <section className="premium-card p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">هل تريد بناء مشروع مشابه؟</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-8 text-muted-foreground">
            يمكننا تحويل الفكرة إلى نطاق واضح، واجهة قابلة للاستخدام، ونظام جاهز للنشر.
          </p>
          <LinkButton href="/contact" className="mt-6">
            ابدأ مشروعًا
          </LinkButton>
        </section>
      </Container>
    </>
  );
}
