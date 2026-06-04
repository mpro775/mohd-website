import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { ServiceCard } from "@/features/services/components/ServiceCard";
import { publicApi } from "@/lib/api/public";

export default async function ServicesPage() {
  const services = await publicApi.services().catch(() => []);
  return (
    <>
      <PageHeader 
        title="الخدمات البرمجية" 
        description="حلول عملية متكاملة مصممة لبناء منتجات ويب سريعة، آمنة، وقابلة للتوسع وفقاً لأحدث معايير هندسة البرمجيات." 
        eyebrow="Services"
        routeLabel="~/services"
      />
      <Container className="py-12">
        <div className="mb-10 rounded-lg border border-border bg-card/30 p-6 md:p-8">
          <h2 className="text-lg font-bold font-mono text-primary mb-3" dir="ltr">{"// Core Development Principles"}</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            أقدم خدمات برمجية متخصصة ومبنية على فهم دقيق لمتطلبات عملك. لا أقوم بكتابة كود فقط، بل أهتم بهندسة المنتج من البداية وتصميم قواعد البيانات وبناء واجهات المستخدم السريعة وتوفير لوحات تحكم مرنة لإدارة المحتوى بسهولة.
          </p>
        </div>

        {services.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="لا توجد خدمات منشورة حالياً" 
            description="يرجى مراجعة صفحة التواصل للاستفسارات العامة."
          />
        )}
      </Container>
    </>
  );
}
