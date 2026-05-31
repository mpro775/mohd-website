import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { publicApi } from "@/lib/api/public";
import { buildMetadata } from "@/lib/seo/metadata";
import { postJsonLd } from "@/lib/seo/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await publicApi.post(slug).catch(() => null);
  if (!post) return {};
  return buildMetadata(post.title, post.summary, post.seo, post.allowIndexing === false);
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await publicApi.post(slug).catch(() => null);
  if (!post) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd(post)) }} />
      <PageHeader title={post.title} description={post.summary} />
      <Container className="py-12">
        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-6">
          <MarkdownRenderer content={post.content} />
        </div>
      </Container>
    </>
  );
}
