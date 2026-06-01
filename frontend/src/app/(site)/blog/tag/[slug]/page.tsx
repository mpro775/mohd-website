import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { PostCard } from "@/features/blog/components/PostCard";
import { publicApi } from "@/lib/api/public";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await publicApi.tag(slug).catch(() => null);
  if (!tag) return {};
  return buildMetadata(`#${tag.name}`, tag.description, undefined, false, `/blog/tag/${slug}`);
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [tag, posts] = await Promise.all([
    publicApi.tag(slug).catch(() => null),
    publicApi.posts({ tagSlug: slug }).catch(() => ({ items: [], meta: undefined })),
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "الرئيسية", item: "/" },
              { name: "المدونة", item: "/blog" },
              { name: `#${tag?.name ?? slug}`, item: `/blog/tag/${slug}` }
            ])
          )
        }}
      />
      <PageHeader title={`#${tag?.name ?? slug}`} description={tag?.description} />
      <Container className="grid gap-5 py-12 md:grid-cols-2 lg:grid-cols-3">{posts.items.map((post) => <PostCard key={post.slug} post={post} />)}</Container>
    </>
  );
}
