import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ServiceCard } from "@/features/services/components/ServiceCard";
import { publicApi } from "@/lib/api/public";

const process = ["فهم الهدف", "تحديد النطاق", "بناء واجهة واضحة", "ربط النظام", "اختبار ونشر"];

export default async function ServicesPage() {
  const services = await publicApi.services().catch(() => []);

  return (
    <>
      <PageHeader
        title="خدمات عملية لبناء منتجات رقمية قابلة للنشر"
        description="باقات تطوير مرنة تساعدك على تحويل الفكرة إلى منتج واضح، قابل للصيانة، وجاهز للاستخدام."
        eyebrow="Services"
        routeLabel="~/services"
      />
      <Container className="space-y-12 py-12">
        {services.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        ) : (
          <EmptyState title="لا توجد خدمات بعد" description="يمكنك التواصل مباشرة لطلب نطاق عمل مخصص." />
        )}

        <section className="premium-card p-6 md:p-8">
          <SectionHeader eyebrow="Process" title="كيف أتعامل مع أي مشروع؟" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {process.map((item, index) => (
              <div key={item} className="glass-panel p-4">
                <CheckCircle2 className="mb-3 h-5 w-5 text-primary" />
                <p dir="ltr" className="font-mono text-xs text-muted-foreground">step_{index + 1}</p>
                <h3 className="mt-1 font-semibold text-foreground">{item}</h3>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}
