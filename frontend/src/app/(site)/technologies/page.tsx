import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { TechnologyCard } from "@/features/technologies/components/TechnologyCard";
import { publicApi } from "@/lib/api/public";

export default async function TechnologiesPage() {
  const technologies = await publicApi.technologies().catch(() => []);
  return (
    <>
      <PageHeader title="التقنيات" description="Stack عملي مستخدم في مشاريع حقيقية، وليس مجرد أيقونات." />
      <Container className="grid gap-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        {technologies.map((technology) => <TechnologyCard key={technology.slug} technology={technology} />)}
      </Container>
    </>
  );
}
