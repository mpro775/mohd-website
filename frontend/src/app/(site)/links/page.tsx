import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { TrackedLink } from "@/features/links/components/TrackedLink";
import { publicApi } from "@/lib/api/public";

export default async function LinksPage() {
  const links = await publicApi.links().catch(() => []);
  const ordered = [...links].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || (a.order ?? 0) - (b.order ?? 0));
  return (
    <>
      <PageHeader title="الروابط" description="روابط عملية للوصول إلى الحسابات والمصادر المهمة." />
      <Container className="grid gap-4 py-12 md:grid-cols-2">{ordered.map((link) => <TrackedLink key={link.slug} link={link} />)}</Container>
    </>
  );
}
