import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { LinkButton } from "@/components/common/Button";
import { publicApi } from "@/lib/api/public";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await publicApi.service(slug).catch(() => null);
  if (!service) return {};
  return buildMetadata(service.name, service.shortDescription, service.seo, false, `/services/${slug}`);
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await publicApi.service(slug).catch(() => null);
  if (!service) notFound();

  const price = service.price ?? (service.startingPrice ? `${service.startingPrice} ${service.currency ?? "USD"}` : "حسب نطاق العمل");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "الرئيسية", item: "/" },
              { name: "الخدمات", item: "/services" },
              { name: service.name, item: `/services/${slug}` }
            ])
          )
        }}
      />
      <PageHeader 
        title={service.name} 
        description={service.shortDescription}
        eyebrow="Service"
        routeLabel={`~/services/${service.slug}`}
      />
      
      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <div className="rounded-lg border border-border bg-card p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold font-mono text-foreground flex items-center gap-1.5 justify-start">
              <span>{"//"}</span>
              <span>وصف الخدمة بالتفصيل</span>
            </h2>
            <p className="leading-8 text-muted-foreground text-sm whitespace-pre-line">
              {service.detailedDescription}
            </p>
          </div>

          {service.deliverables?.length ? (
            <div className="rounded-lg border border-border bg-card p-6 md:p-8">
              <h2 className="mb-4 text-xl font-bold font-mono text-foreground flex items-center gap-1.5 justify-start">
                <span>{"//"}</span>
                <span>ماذا سأبني لك؟ (Deliverables)</span>
              </h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {service.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="leading-7">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {service.requirements?.length ? (
            <div className="rounded-lg border border-border bg-card p-6 md:p-8">
              <h2 className="mb-4 text-xl font-bold font-mono text-foreground flex items-center gap-1.5 justify-start">
                <span>{"//"}</span>
                <span>ماذا أحتاج منك للبدء؟ (Requirements)</span>
              </h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {service.requirements.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-warning/10 font-mono text-xs text-warning shrink-0 mt-0.5 font-bold">!</span>
                    <span className="leading-7">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* Sidebar parameters card */}
        <aside className="h-fit space-y-6 rounded-lg border border-border bg-card p-6">
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-semibold text-foreground uppercase border-b border-border/40 pb-2">{"// Pricing & Delivery"}</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">سعر البدء للخدمة:</span>
                <span className="text-2xl font-extrabold text-primary font-sans leading-none">{price}</span>
              </div>
              
              {service.duration && (
                <div className="flex justify-between items-center border-t border-border/30 pt-3">
                  <span className="text-xs text-muted-foreground">المدة المتوقعة لتنفيذ العمل:</span>
                  <span className="font-semibold text-foreground font-mono">{service.duration}</span>
                </div>
              )}
            </div>
          </div>

          {!service.startingPrice && !service.price && (
            <p className="text-xs text-muted-foreground/80 leading-5">
              * السعر النهائي يتم تحديده بدقة حسب نطاق العمل والمتطلبات التفصيلية لمشروعك.
            </p>
          )}

          <LinkButton href={service.ctaUrl ?? "/contact"} className="w-full justify-center gap-1.5" size="lg">
            {service.ctaText ?? "ابدأ النقاش"}
          </LinkButton>
        </aside>
      </Container>
    </>
  );
}
