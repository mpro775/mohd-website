import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { FaqList } from "@/features/faqs/components/FaqList";
import { EmptyState } from "@/components/common/State";
import { publicApi } from "@/lib/api/public";

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
      <Container className="py-12 max-w-3xl">
        {faqs.items.length > 0 ? (
          <FaqList faqs={faqs.items} />
        ) : (
          <EmptyState 
            title="لا توجد أسئلة شائعة حالياً" 
            description="يمكنك توجيه سؤالك مباشرة عبر نموذج صفحة التواصل."
          />
        )}
      </Container>
    </>
  );
}
