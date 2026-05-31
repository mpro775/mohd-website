import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { ServiceCard } from "@/features/services/components/ServiceCard";
import { publicApi } from "@/lib/api/public";

export default async function ServicesPage() {
  const services = await publicApi.services().catch(() => []);
  return (
    <>
      <PageHeader title="الخدمات" description="خدمات برمجية عملية: واجهات، APIs، لوحات إدارة، وتحسين أداء." />
      <Container className="py-12">
        {services.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard key={service.slug} service={service} />)}</div> : <EmptyState title="لا توجد خدمات منشورة" />}
      </Container>
    </>
  );
}
