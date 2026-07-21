import Link from "next/link";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { PostCard } from "@/features/blog/components/PostCard";
import { publicApi } from "@/lib/api/public";

const emptyMeta = { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false };

export default async function BlogPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const query = { page, search: params.search, categorySlug: params.category, tagSlug: params.tag };
  const [posts, featured, categories, tags] = await Promise.all([
    publicApi.posts(query).catch(() => ({ items: [], meta: emptyMeta })),
    publicApi.posts({ featured: true, limit: 1 }).catch(() => ({ items: [], meta: emptyMeta })),
    publicApi.categories().catch(() => []),
    publicApi.tags().catch(() => []),
  ]);
  const active = Object.entries({ search: params.search, category: params.category, tag: params.tag }).filter(([, value]) => value);
  return <><PageHeader title="ملاحظات هندسية من واقع بناء المنتجات" description="مقالات عربية وإنجليزية في الواجهات والباك إند والأداء وقرارات هندسة المنتجات." eyebrow="Engineering Notes" routeLabel="~/blog" /><Container className="space-y-10 py-12">{page === 1 && !active.length && featured.items[0] ? <PostCard post={featured.items[0]} featured /> : null}<section className="space-y-4 rounded-xl border border-border bg-card/40 p-4"><form action="/blog" className="flex gap-2"><input type="search" name="search" defaultValue={params.search} minLength={2} placeholder="ابحث في المقالات…" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-4 py-2" /><button className="rounded-lg bg-primary px-4 font-bold text-primary-foreground">بحث</button></form><div className="flex flex-wrap gap-2 text-xs"><Link href="/blog" className="rounded-full border border-border px-3 py-1">كل التصنيفات</Link>{categories.map((item) => <Link key={item.slug} href={`/blog/category/${item.slug}`} className="rounded-full border border-border px-3 py-1 hover:text-primary">{item.name} <span className="opacity-60">({item.postCount ?? 0})</span></Link>)}</div><div className="flex flex-wrap gap-2 text-xs">{tags.filter((item) => (item.postCount ?? 0) > 0).slice(0, 20).map((item) => <Link key={item.slug} href={`/blog/tag/${item.slug}`} className="rounded-full border border-border px-3 py-1 hover:text-primary">#{item.name} <span className="opacity-60">({item.postCount})</span></Link>)}</div>{active.length ? <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs"><span>الفلاتر النشطة:</span>{active.map(([key, value]) => { const next = new URLSearchParams(); for (const [otherKey, otherValue] of active) if (otherKey !== key && otherValue) next.set(otherKey, otherValue); return <Link key={key} href={`/blog${next.size ? `?${next}` : ""}`} className="rounded-full bg-primary/10 px-3 py-1 text-primary">{key}: {value} ×</Link>; })}</div> : null}</section><div className="flex items-center justify-between"><h2 className="text-2xl font-black">{params.search ? `نتائج البحث عن «${params.search}»` : "أحدث المقالات"}</h2><span className="text-sm text-muted-foreground">{posts.meta.total} مقال</span></div>{posts.items.length ? <><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{posts.items.map((post) => <PostCard key={post.slug} post={post} />)}</div><Pagination meta={posts.meta} basePath="/blog" query={{ search: params.search, category: params.category, tag: params.tag }} /></> : <EmptyState title={params.search ? "لا توجد نتائج" : "لا توجد مقالات ضمن الفلتر"} description="جرّب تغيير عبارة البحث أو إزالة أحد الفلاتر." />}</Container></>;
}
