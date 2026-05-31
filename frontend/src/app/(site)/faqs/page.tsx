import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { FaqList } from "@/features/faqs/components/FaqList";
import { publicApi } from "@/lib/api/public";

export default async function FaqsPage() {
  const faqs = await publicApi.faqs({ limit: 50 }).catch(() => ({ items: [], meta: undefined }));
  return (
    <>
      <PageHeader title="الأسئلة الشائعة" description="إجابات مختصرة حول العمل والخدمات وطريقة التعاون." />
      <Container className="py-12"><FaqList faqs={faqs.items} /></Container>
    </>
  );
}
