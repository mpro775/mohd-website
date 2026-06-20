import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
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
              { name: service.name, item: `/services/${slug}` },
            ]),
          ),
        }}
      />
      <PageHeader
        title={service.name}
        description={service.shortDescription}
        eyebrow="Service Package"
        routeLabel={`~/services/${service.slug}`}
      />

      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="premium-card p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold text-foreground">لمن هذه الخدمة؟</h2>
            <p className="whitespace-pre-line text-sm leading-8 text-muted-foreground">
              {service.detailedDescription ?? service.shortDescription}
            </p>
          </section>

          {service.deliverables?.length ? (
            <section className="premium-card p-6 md:p-8">
              <h2 className="mb-4 text-xl font-bold text-foreground">ماذا سأبني؟</h2>
              <ul className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                {service.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <span className="leading-7">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {service.requirements?.length ? (
            <section className="premium-card p-6 md:p-8">
              <h2 className="mb-4 text-xl font-bold text-foreground">المتطلبات من العميل</h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {service.requirements.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="leading-7">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="premium-card h-fit p-6">
          <p className="text-sm text-muted-foreground">السعر</p>
          <p className="mt-2 text-3xl font-bold text-primary">{price}</p>
          {service.duration ? <p dir="ltr" className="mt-3 font-mono text-xs text-muted-foreground">duration: {service.duration}</p> : null}
          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            السعر النهائي يعتمد على نطاق العمل والتكاملات المطلوبة.
          </p>
          <LinkButton href={service.ctaUrl ?? "/contact"} className="mt-6 w-full">
            {service.ctaText ?? "ابدأ النقاش"}
          </LinkButton>
        </aside>
      </Container>
    </>
  );
}
