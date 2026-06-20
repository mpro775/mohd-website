import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { PageHeader } from "@/components/common/PageHeader";
import { TrackedLink } from "@/features/links/components/TrackedLink";
import { publicApi } from "@/lib/api/public";

export default async function LinksPage() {
  const links = await publicApi.links().catch(() => []);
  const ordered = [...links].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || (a.order ?? 0) - (b.order ?? 0));

  return (
    <>
      <PageHeader
        title="Digital business card"
        description="روابط مباشرة لحساباتي المهنية، المشاريع، والمصادر المهمة."
        eyebrow="Links"
        routeLabel="~/links"
      />
      <Container className="py-12">
        {ordered.length ? (
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
            {ordered.map((link) => (
              <TrackedLink key={link.slug} link={link} />
            ))}
          </div>
        ) : (
          <EmptyState title="لا توجد روابط بعد" description="سيتم إضافة الروابط المهنية قريبًا." />
        )}
      </Container>
    </>
  );
}
