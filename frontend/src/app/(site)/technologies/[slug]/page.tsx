import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { StatusBadge } from "@/components/common/StatusBadge";
import { LinkButton } from "@/components/common/Button";
import { publicApi } from "@/lib/api/public";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const technology = await publicApi.technology(slug).catch(() => null);
  if (!technology) return {};
  return buildMetadata(technology.name, technology.description, undefined, false, `/technologies/${slug}`);
}

export default async function TechnologyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const technology = await publicApi.technology(slug).catch(() => null);
  if (!technology) notFound();

  const eyebrow = technology.category ?? technology.group ?? "Stack";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "الرئيسية", item: "/" },
              { name: "التقنيات", item: "/technologies" },
              { name: technology.name, item: `/technologies/${slug}` }
            ])
          )
        }}
      />
      <PageHeader 
        title={technology.name} 
        description={technology.description}
        eyebrow={eyebrow}
        routeLabel={`~/stack/${technology.slug}`}
      />
      
      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 md:p-8">
            <h2 className="mb-4 text-lg font-bold font-mono text-foreground flex items-center gap-1.5 justify-start">
              <span>{"//"}</span>
              <span>حول التقنية</span>
            </h2>
            <p className="leading-8 text-muted-foreground text-sm">
              {technology.description || "لا يوجد وصف تفصيلي متوفر لهذه التقنية حالياً."}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 md:p-8">
            <h2 className="mb-4 text-lg font-bold font-mono text-foreground flex items-center gap-1.5 justify-start">
              <span>{"//"}</span>
              <span>كيف أستخدم هذه التقنية عملياً؟</span>
            </h2>
            <p className="leading-8 text-muted-foreground text-sm">
              أستخدم تقنية <span className="font-mono font-bold text-primary" dir="ltr">{technology.name}</span> بشكل فعال ضمن مشاريع عملية لبناء واجهات تفاعلية سريعة، أو تصميم وتطوير APIs آمنة وقابلة للتطوير، أو تحسين كفاءة تجربة التطوير (Developer Experience) وإدارة دورة حياة البرمجيات بدقة حسب طبيعة ومتطلبات كل مشروع.
            </p>
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <aside className="h-fit space-y-6 rounded-lg border border-border bg-card p-6">
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-semibold text-foreground uppercase border-b border-border/40 pb-2">{"// Tech Specs"}</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">المستوى:</span>
                <StatusBadge value={technology.proficiencyLevel} />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">التصنيف:</span>
                <span className="font-semibold text-foreground">{technology.category ?? technology.group ?? "—"}</span>
              </div>
              
              {technology.yearsOfExperience !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">سنوات الخبرة:</span>
                  <span className="font-semibold text-foreground font-mono">{technology.yearsOfExperience} {technology.yearsOfExperience === 1 ? "سنة" : "سنوات"}</span>
                </div>
              )}

              {technology.highlighted && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">الوضعية:</span>
                  <span className="inline-flex rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs text-primary font-mono uppercase">highlighted</span>
                </div>
              )}
            </div>
          </div>

          {technology.officialUrl && (
            <div className="pt-2">
              <LinkButton href={technology.officialUrl} target="_blank" rel="noreferrer" className="w-full justify-center gap-1.5" size="md">
                الموقع الرسمي <ExternalLink className="h-4 w-4" />
              </LinkButton>
            </div>
          )}
        </aside>
      </Container>
    </>
  );
}
