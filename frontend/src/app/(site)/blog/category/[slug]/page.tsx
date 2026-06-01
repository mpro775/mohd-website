import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { PostCard } from "@/features/blog/components/PostCard";
import { publicApi } from "@/lib/api/public";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await publicApi.category(slug).catch(() => null);
  if (!category) return {};
  return buildMetadata(category.name, category.description, undefined, false, `/blog/category/${slug}`);
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, posts] = await Promise.all([
    publicApi.category(slug).catch(() => null),
    publicApi.posts({ categorySlug: slug }).catch(() => ({ items: [], meta: undefined })),
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
              { name: category?.name ?? "تصنيف", item: `/blog/category/${slug}` }
            ])
          )
        }}
      />
      <PageHeader title={category?.name ?? "تصنيف"} description={category?.description} />
      <Container className="grid gap-5 py-12 md:grid-cols-2 lg:grid-cols-3">{posts.items.map((post) => <PostCard key={post.slug} post={post} />)}</Container>
    </>
  );
}
