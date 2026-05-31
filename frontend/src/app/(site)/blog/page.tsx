import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { Pagination } from "@/components/common/Pagination";
import { PostCard } from "@/features/blog/components/PostCard";
import { publicApi } from "@/lib/api/public";

export default async function BlogPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [posts, categories, tags] = await Promise.all([
    publicApi.posts({ page: params.page ?? 1, search: params.search, categorySlug: params.category, tagSlug: params.tag }).catch(() => ({ items: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false } })),
    publicApi.categories().catch(() => []),
    publicApi.tags().catch(() => []),
  ]);
  return (
    <>
      <PageHeader title="المدونة التقنية" description="مقالات عن هندسة البرمجيات، التجارب العملية، وبناء منتجات ويب قابلة للصيانة." />
      <Container className="py-12">
        <form className="mb-6 flex flex-col gap-3 md:flex-row">
          <input name="search" defaultValue={params.search} placeholder="ابحث في المقالات" className="h-11 flex-1 rounded-md border border-border bg-card px-3 outline-none focus:border-primary" />
          <button className="rounded-md bg-primary px-5 font-semibold text-primary-foreground">بحث</button>
        </form>
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => <Link key={category.slug} href={`/blog/category/${category.slug}`} className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">{category.name}</Link>)}
          {tags.map((tag) => <Link key={tag.slug} href={`/blog/tag/${tag.slug}`} className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">#{tag.name}</Link>)}
        </div>
        {posts.items.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{posts.items.map((post) => <PostCard key={post.slug} post={post} />)}</div> : <EmptyState title="لا توجد مقالات" />}
        <Pagination meta={posts.meta} basePath="/blog" />
      </Container>
    </>
  );
}
