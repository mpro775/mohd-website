import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { publicApi } from "@/lib/api/public";

export default async function TechnologyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const technology = await publicApi.technology(slug).catch(() => null);
  if (!technology) notFound();
  return (
    <>
      <PageHeader title={technology.name} description={technology.description} />
      <Container className="py-12">
        <div className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
          <p>المستوى: {technology.proficiencyLevel}</p>
          <p>التصنيف: {technology.category ?? technology.group}</p>
          {technology.yearsOfExperience ? <p>سنوات الخبرة: {technology.yearsOfExperience}</p> : null}
        </div>
      </Container>
    </>
  );
}
