import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { PostCard } from "@/features/blog/components/PostCard";
import { publicApi } from "@/lib/api/public";

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [tag, posts] = await Promise.all([
    publicApi.tag(slug).catch(() => null),
    publicApi.posts({ tagSlug: slug }).catch(() => ({ items: [], meta: undefined })),
  ]);
  return (
    <>
      <PageHeader title={`#${tag?.name ?? slug}`} description={tag?.description} />
      <Container className="grid gap-5 py-12 md:grid-cols-2 lg:grid-cols-3">{posts.items.map((post) => <PostCard key={post.slug} post={post} />)}</Container>
    </>
  );
}
