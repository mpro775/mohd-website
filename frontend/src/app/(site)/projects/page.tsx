import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { Pagination } from "@/components/common/Pagination";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { publicApi } from "@/lib/api/public";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const projects = await publicApi.projects({ page: params.page ?? 1, search: params.search, category: params.category, technology: params.technology }).catch(() => ({ items: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false } }));
  return (
    <>
      <PageHeader title="المشاريع" description="Case studies تقنية تعرض المشكلة والحل والـ stack والنتيجة." />
      <Container className="py-12">
        <form className="mb-8 flex flex-col gap-3 md:flex-row">
          <input name="search" defaultValue={params.search} placeholder="ابحث في المشاريع" className="h-11 flex-1 rounded-md border border-border bg-card px-3 outline-none focus:border-primary" />
          <button className="rounded-md bg-primary px-5 font-semibold text-primary-foreground">بحث</button>
        </form>
        {projects.items.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{projects.items.map((project) => <ProjectCard key={project.slug} project={project} />)}</div> : <EmptyState title="لا توجد مشاريع" />}
        <Pagination meta={projects.meta} basePath="/projects" />
      </Container>
    </>
  );
}
