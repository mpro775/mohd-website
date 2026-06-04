import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { FaqList } from "@/features/faqs/components/FaqList";
import { EmptyState } from "@/components/common/State";
import { publicApi } from "@/lib/api/public";
import { ScrollReveal } from "@/components/site/home/ScrollReveal";

export default async function FaqsPage() {
  const faqs = await publicApi.faqs({ limit: 50 }).catch(() => ({ items: [], meta: undefined }));
  
  return (
    <>
      <PageHeader 
        title="الأسئلة الشائعة" 
        description="إجابات واضحة ومختصرة حول الخدمات وطرق الدفع والتعاون والعمل المشترك." 
        eyebrow="FAQ"
        routeLabel="~/faqs"
      />
      <Container className="py-12 max-w-3xl relative">
        {/* Background glow */}
        <div className="ambient-glow -top-10 left-10 opacity-60" />
        
        <ScrollReveal className="relative z-10">
          {faqs.items.length > 0 ? (
            <FaqList faqs={faqs.items} />
          ) : (
            <EmptyState 
              title="لا توجد أسئلة شائعة حالياً" 
              description="يمكنك توجيه سؤالك مباشرة عبر نموذج صفحة التواصل."
            />
          )}
        </ScrollReveal>
      </Container>
    </>
  );
}
