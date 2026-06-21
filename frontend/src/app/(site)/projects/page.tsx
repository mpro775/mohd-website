import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { PageHeader } from "@/components/common/PageHeader";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { publicApi } from "@/lib/api/public";

export default async function ProjectsPage() {
  const projects = await publicApi.projects({ limit: 100 }).catch(() => ({
    items: [],
    meta: { total: 0, page: 1, limit: 100, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
  }));

  const categories = Array.from(new Set(projects.items.map((project) => project.category).filter(Boolean)));
  const statuses = Array.from(new Set(projects.items.map((project) => project.status).filter(Boolean)));
  
  const techMap = new Map<string, any>();
  for (const project of projects.items) {
    for (const tech of project.technologies ?? []) {
      techMap.set(tech.slug, tech);
    }
  }
  const technologies = Array.from(techMap.values()).slice(0, 12);

  return (
    <>
      <PageHeader
        title="مشاريع تحولت من فكرة إلى نظام قابل للاستخدام"
        description="مجموعة مختارة من المشاريع التي تعكس طريقة تفكيري في الواجهة، الباك إند، تجربة المستخدم، والنشر."
        eyebrow="Projects"
        routeLabel="~/projects"
      />
      <Container className="py-12">
        {(categories.length || statuses.length || technologies.length) ? (
          <div className="mb-8 space-y-3 rounded-xl border border-border bg-card/40 p-4">
            {categories.length ? (
              <div className="flex flex-wrap gap-2 text-xs">
                <span dir="ltr" className="font-mono text-primary">{"// categories"}</span>
                {categories.map((category) => (
                  <span key={category} className="rounded-full border border-border px-3 py-1 text-muted-foreground">{category}</span>
                ))}
              </div>
            ) : null}
            {statuses.length ? (
              <div className="flex flex-wrap gap-2 text-xs">
                <span dir="ltr" className="font-mono text-primary">{"// status"}</span>
                {statuses.map((status) => (
                  <span key={status} dir="ltr" className="rounded-full border border-border px-3 py-1 text-muted-foreground">{status}</span>
                ))}
              </div>
            ) : null}
            {technologies.length ? (
              <div className="flex flex-wrap gap-2 text-xs">
                <span dir="ltr" className="font-mono text-primary">{"// stack"}</span>
                {technologies.map((tech) => (
                  <span key={tech.slug} dir="ltr" className="rounded-full border border-border px-3 py-1 text-muted-foreground">{tech.name}</span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {projects.items.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.items.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState title="لا توجد مشاريع بعد" description="لا توجد مشاريع منشورة حاليًا. ستظهر دراسات الحالة هنا عند توفرها." />
        )}
      </Container>
    </>
  );
}
