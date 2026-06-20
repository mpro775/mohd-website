import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { PageHeader } from "@/components/common/PageHeader";
import { TechnologyCard } from "@/features/technologies/components/TechnologyCard";
import { publicApi } from "@/lib/api/public";
import type { Technology } from "@/lib/api/types";

export default async function TechnologiesPage() {
  const technologies = await publicApi.technologies().catch(() => [] as Technology[]);
  const grouped = technologies.reduce<Record<string, Technology[]>>((acc, tech) => {
    const group = tech.category || tech.group || "Tools";
    acc[group] = acc[group] ?? [];
    acc[group].push(tech);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Toolbox لبناء منتجات حقيقية"
        description="الأدوات واللغات والمكتبات التي أستخدمها عمليًا لبناء واجهات، APIs، قواعد بيانات، وتجارب قابلة للنشر."
        eyebrow="Toolbox"
        routeLabel="~/technologies"
      />
      <Container className="space-y-12 py-12">
        {technologies.length ? (
          Object.entries(grouped).map(([group, items]) => (
            <section key={group}>
              <h2 className="mb-5 border-b border-border/40 pb-3 text-lg font-bold text-foreground">
                <span dir="ltr" className="font-mono text-primary">{"// "}</span>{group}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((technology) => (
                  <TechnologyCard key={technology.slug} technology={technology} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <EmptyState title="لا توجد تقنيات بعد" description="ستظهر أدوات العمل هنا عند إضافتها." />
        )}
      </Container>
    </>
  );
}
