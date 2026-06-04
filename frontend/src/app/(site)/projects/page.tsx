import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { Pagination } from "@/components/common/Pagination";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { publicApi } from "@/lib/api/public";
import Link from "next/link";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const category = params.category;
  const technology = params.technology;

  const projects = await publicApi.projects({ 
    page, 
    category, 
    technology 
  }).catch(() => ({ 
    items: [], 
    meta: { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false } 
  }));

  // Dynamically extract categories from the loaded projects list for filtering visual aid
  const categories = Array.from(new Set(projects.items.map((p) => p.category).filter(Boolean))) as string[];

  return (
    <>
      <PageHeader 
        title="المشاريع" 
        description="دراسات حالة (Case Studies) تقنية تعرض المشكلة والحل والـ stack والنتيجة المحققة." 
        eyebrow="Projects"
        routeLabel="~/projects"
      />
      <Container className="py-12">
        {/* Filters bar */}
        {(categories.length > 0 || category || technology) && (
          <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-border/40 pb-6">
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-muted-foreground/80">{"// Category:"}</span>
                <Link
                  href="/projects"
                  className={`rounded-full px-3 py-1 border transition ${!category ? "bg-primary/10 border-primary/40 text-primary font-semibold" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
                >
                  الكل
                </Link>
                {categories.map((cat) => {
                  const isActive = category === cat;
                  return (
                    <Link
                      key={cat}
                      href={`/projects?category=${encodeURIComponent(cat)}`}
                      className={`rounded-full px-3 py-1 border transition ${isActive ? "bg-primary/10 border-primary/40 text-primary font-semibold" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
                    >
                      {cat}
                    </Link>
                  );
                })}
              </div>
            )}
            
            {technology && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-muted-foreground/80">{"// Technology:"}</span>
                <span className="rounded-full px-3 py-1 border border-primary/30 bg-primary/5 text-primary font-semibold flex items-center gap-1.5" dir="ltr">
                  <span>{technology}</span>
                  <Link href="/projects" className="hover:text-red-500 font-bold ml-1 text-[10px]" title="إزالة الفلترة">
                    ✕
                  </Link>
                </span>
              </div>
            )}
          </div>
        )}

        {projects.items.length ? (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {projects.items.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
            <Pagination meta={projects.meta} basePath="/projects" />
          </>
        ) : (
          <EmptyState 
            title="لا توجد مشاريع منشورة حاليًا" 
            description="أضف مشروعًا من لوحة التحكم ليظهر هنا كدراسة حالة." 
          />
        )}
      </Container>
    </>
  );
}
