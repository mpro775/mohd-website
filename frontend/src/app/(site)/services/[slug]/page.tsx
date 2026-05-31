import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { LinkButton } from "@/components/common/Button";
import { publicApi } from "@/lib/api/public";

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await publicApi.service(slug).catch(() => null);
  if (!service) notFound();
  return (
    <>
      <PageHeader title={service.name} description={service.shortDescription} />
      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border bg-card p-6 leading-8 text-muted-foreground">{service.detailedDescription}</div>
        <aside className="h-fit rounded-lg border border-border bg-card p-6">
          <p className="text-lg font-bold text-primary">{service.price ?? (service.startingPrice ? `${service.startingPrice} ${service.currency}` : "حسب نطاق العمل")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{service.duration}</p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">{service.deliverables?.map((item) => <li key={item}>- {item}</li>)}</ul>
          <LinkButton href={service.ctaUrl ?? "/contact"} className="mt-6 w-full">{service.ctaText ?? "ابدأ النقاش"}</LinkButton>
        </aside>
      </Container>
    </>
  );
}
