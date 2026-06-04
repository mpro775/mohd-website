import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { Pagination } from "@/components/common/Pagination";
import { PostCard } from "@/features/blog/components/PostCard";
import { publicApi } from "@/lib/api/public";

export default async function BlogPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const activeCategory = params.category;
  const activeTag = params.tag;

  const [posts, categories, tags] = await Promise.all([
    publicApi.posts({ 
      page, 
      categorySlug: activeCategory, 
      tagSlug: activeTag 
    }).catch(() => ({ 
      items: [], 
      meta: { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false } 
    })),
    publicApi.categories().catch(() => []),
    publicApi.tags().catch(() => []),
  ]);

  const isNoFilter = !activeCategory && !activeTag;

  return (
    <>
      <PageHeader 
        title="المدونة التقنية" 
        description="تجارب عملية ومقالات تفصيلية حول هندسة البرمجيات، تصميم الواجهات، وبناء تطبيقات ويب متكاملة وقابلة للصيانة." 
        eyebrow="Blog"
        routeLabel="~/blog"
      />
      <Container className="py-12">
        {/* Filtering Options */}
        <div className="mb-10 space-y-4 border-b border-border/40 pb-6">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-muted-foreground/80">{"// Categories:"}</span>
            <Link
              href="/blog"
              className={`rounded-full px-3 py-1 border transition ${
                isNoFilter ? "bg-primary/10 border-primary/40 text-primary font-semibold" : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              الكل
            </Link>
            {categories.map((category) => {
              const isActive = activeCategory === category.slug;
              return (
                <Link
                  key={category.slug}
                  href={`/blog?category=${category.slug}`}
                  className={`rounded-full px-3 py-1 border transition ${
                    isActive ? "bg-primary/10 border-primary/40 text-primary font-semibold" : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-muted-foreground/80">{"// Tags:"}</span>
              {tags.map((tag) => {
                const isActive = activeTag === tag.slug;
                return (
                  <Link
                    key={tag.slug}
                    href={`/blog?tag=${tag.slug}`}
                    className={`rounded-full px-3 py-1 border transition ${
                      isActive ? "bg-primary/10 border-primary/40 text-primary font-semibold" : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    #{tag.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {posts.items.length ? (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.items.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
            <Pagination meta={posts.meta} basePath="/blog" />
          </>
        ) : (
          <EmptyState 
            title="لا توجد مقالات منشورة" 
            description="لم نجد مقالات مطابقة للتصنيفات المحددة حالياً."
          />
        )}
      </Container>
    </>
  );
}
