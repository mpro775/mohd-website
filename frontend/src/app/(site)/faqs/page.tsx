import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { PageHeader } from "@/components/common/PageHeader";
import { FaqList } from "@/features/faqs/components/FaqList";
import { publicApi } from "@/lib/api/public";

export default async function FaqsPage() {
  const faqs = await publicApi.faqs({ limit: 50 }).catch(() => ({ items: [], meta: undefined }));

  return (
    <>
      <PageHeader
        title="أسئلة شائعة قبل بدء المشروع"
        description="إجابات مختصرة حول طريقة العمل، النطاق، التواصل، وما تحتاجه قبل إرسال طلب مشروع."
        eyebrow="FAQ"
        routeLabel="~/faqs"
      />
      <Container className="max-w-4xl py-12">
        {faqs.items.length ? (
          <FaqList faqs={faqs.items} />
        ) : (
          <EmptyState title="لا توجد أسئلة شائعة بعد" description="يمكنك إرسال سؤالك مباشرة من صفحة التواصل." />
        )}
      </Container>
    </>
  );
}
