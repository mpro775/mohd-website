import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { publicApi } from "@/lib/api/public";

export default async function ContactPage() {
  const profile = await publicApi.profile().catch(() => null);
  return (
    <>
      <PageHeader title="التواصل" description="للتعاون المهني، بناء منتج، تحسين أداء، أو استشارة تقنية." />
      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_380px]">
        <ContactForm />
        <aside className="h-fit rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-bold">معلومات التواصل</h2>
          <p className="mt-4 text-muted-foreground">{profile?.email}</p>
          <p className="mt-2 text-muted-foreground">{profile?.phone}</p>
          <p className="mt-2 text-muted-foreground">{profile?.location}</p>
        </aside>
      </Container>
    </>
  );
}
