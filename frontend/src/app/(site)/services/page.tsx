import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { ServiceCard } from "@/features/services/components/ServiceCard";
import { publicApi } from "@/lib/api/public";
import { ScrollReveal, StaggerReveal, StaggerItem } from "@/components/site/home/ScrollReveal";

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
      <Container className="py-12 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="ambient-glow -top-24 left-10 opacity-70" />
        
        <ScrollReveal>
          <div className="mb-10 glass-card p-6 md:p-8 relative z-10">
            <h2 className="text-lg font-bold font-mono text-primary mb-3" dir="ltr">{"// Core Development Principles"}</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              أقدم خدمات برمجية متخصصة ومبنية على فهم دقيق لمتطلبات عملك. لا أقوم بكتابة كود فقط، بل أهتم بهندسة المنتج من البداية وتصميم قواعد البيانات وبناء واجهات المستخدم السريعة وتوفير لوحات تحكم مرنة لإدارة المحتوى بسهولة.
            </p>
          </div>
        </ScrollReveal>

        {services.length ? (
          <div className="relative z-10">
            <StaggerReveal className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <StaggerItem key={service.slug}>
                  <ServiceCard service={service} />
                </StaggerItem>
              ))}
            </StaggerReveal>
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
