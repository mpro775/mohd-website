import Link from "next/link";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { PostCard } from "@/features/blog/components/PostCard";
import { publicApi } from "@/lib/api/public";

export default async function BlogPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const activeCategory = params.category;
  const activeTag = params.tag;

  const [posts, categories, tags] = await Promise.all([
    publicApi.posts({ page, categorySlug: activeCategory, tagSlug: activeTag }).catch(() => ({
      items: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    })),
    publicApi.categories().catch(() => []),
    publicApi.tags().catch(() => []),
  ]);

  return (
    <>
      <PageHeader
        title="ملاحظات هندسية من واقع بناء المنتجات"
        description="Engineering Notes عن الواجهات، الباك إند، تجربة المستخدم، الأداء، والقرارات التي تظهر أثناء بناء منتجات رقمية حقيقية."
        eyebrow="Engineering Notes"
        routeLabel="~/blog"
      />
      <Container className="py-12">
        <div className="mb-8 space-y-3 rounded-xl border border-border bg-card/40 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span dir="ltr" className="font-mono text-primary">{"// categories"}</span>
            <Link href="/blog" className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-primary">الكل</Link>
            {categories.map((category) => (
              <Link key={category.slug} href={`/blog?category=${category.slug}`} className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-primary">
                {category.name}
              </Link>
            ))}
          </div>
          {tags.length ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span dir="ltr" className="font-mono text-primary">{"// tags"}</span>
              {tags.map((tag) => (
                <Link key={tag.slug} href={`/blog?tag=${tag.slug}`} className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-primary">
                  #{tag.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {posts.items.length ? (
          <div className="space-y-8">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.items.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
            <Pagination meta={posts.meta} basePath="/blog" />
          </div>
        ) : (
          <EmptyState title="لا توجد مقالات بعد" description="لا توجد ملاحظات هندسية منشورة ضمن الفلتر الحالي." />
        )}
      </Container>
    </>
  );
}
