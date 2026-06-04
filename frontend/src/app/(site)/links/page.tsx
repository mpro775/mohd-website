import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { TrackedLink } from "@/features/links/components/TrackedLink";
import { EmptyState } from "@/components/common/State";
import { publicApi } from "@/lib/api/public";
import { ScrollReveal, StaggerReveal, StaggerItem } from "@/components/site/home/ScrollReveal";

export default async function LinksPage() {
  const links = await publicApi.links().catch(() => []);
  const ordered = [...links].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || (a.order ?? 0) - (b.order ?? 0));
  
  return (
    <>
      <PageHeader 
        title="روابط مفيدة" 
        description="روابط مباشرة للوصول إلى حساباتي المهنية ومشاريعي والمصادر البرمجية المفيدة." 
        eyebrow="Links"
        routeLabel="~/links"
      />
      <Container className="py-12 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="ambient-glow -top-10 left-10 opacity-60" />
        
        {ordered.length > 0 ? (
          <div className="relative z-10">
            <StaggerReveal className="grid gap-4 md:grid-cols-2">
              {ordered.map((link) => (
                <StaggerItem key={link.slug}>
                  <TrackedLink link={link} />
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>
        ) : (
          <EmptyState 
            title="لا توجد روابط مضافة" 
            description="سيتم إضافة الروابط المهنية قريباً."
          />
        )}
      </Container>
    </>
  );
}
