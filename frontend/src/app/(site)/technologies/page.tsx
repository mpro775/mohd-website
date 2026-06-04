import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { TechnologyCard } from "@/features/technologies/components/TechnologyCard";
import { EmptyState } from "@/components/common/State";
import { publicApi } from "@/lib/api/public";
import type { Technology } from "@/lib/api/types";

type GroupedTechs = Record<string, Technology[]>;

export default async function TechnologiesPage() {
  const technologies = await publicApi.technologies().catch(() => [] as Technology[]);
  
  // Group technologies by category/group dynamically
  const grouped: GroupedTechs = {};
  technologies.forEach((tech) => {
    const cat = tech.category || tech.group || "أخرى";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(tech);
  });

  return (
    <>
      <PageHeader 
        title="التقنيات والخبرات" 
        description="الأدوات واللغات والمكتبات التي أستخدمها عملياً لبناء المنتجات وتوفير أفضل أداء وحلول قابلة للتطوير." 
        eyebrow="Stack"
        routeLabel="~/stack"
      />
      <Container className="py-12 space-y-12">
        {technologies.length > 0 ? (
          Object.entries(grouped).map(([categoryName, techList]) => (
            <section key={categoryName} className="space-y-5">
              <h2 className="text-lg font-bold font-mono text-foreground border-b border-border/40 pb-2.5 flex items-center gap-2 justify-start">
                <span className="text-primary">{"//"}</span>
                <span className="uppercase tracking-wider">{categoryName}</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {techList.map((technology) => (
                  <TechnologyCard key={technology.slug} technology={technology} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <EmptyState 
            title="لا توجد تقنيات مضافة حالياً" 
            description="سيتم تحديث قائمة التقنيات قريباً."
          />
        )}
      </Container>
    </>
  );
}
