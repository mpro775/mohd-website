import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/State";
import { Pagination } from "@/components/common/Pagination";
import { JsonLd } from "@/components/common/JsonLd";
import { PostCard } from "@/features/blog/components/PostCard";
import { publicApi } from "@/lib/api/public";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const item = await publicApi.category(slug).catch(() => null); return item ? buildMetadata(item.seo?.metaTitle ?? item.name, item.seo?.metaDescription ?? item.description, item.seo, false, `/blog/category/${item.slug}`) : {}; }

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await publicApi.category(slug).catch(() => null);
  if (!category) notFound();
  const page = Math.max(1, Number(query.page ?? 1));
  const posts = await publicApi.posts({ categorySlug: slug, page }).catch(() => ({ items: [], meta: { total: 0, page, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: page > 1 } }));
  return <><JsonLd data={breadcrumbJsonLd([{ name: "الرئيسية", item: "/" }, { name: "المدونة", item: "/blog" }, { name: category.name, item: `/blog/category/${slug}` }])} /><PageHeader title={category.name} description={`${category.description ?? "مقالات هذا التصنيف"} · ${posts.meta.total} مقال`} /><Container className="py-12"><nav className="mb-6 flex gap-2 text-xs text-muted-foreground"><Link href="/">الرئيسية</Link><span>/</span><Link href="/blog">المدونة</Link><span>/</span><span>{category.name}</span></nav>{posts.items.length ? <><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{posts.items.map((post) => <PostCard key={post.slug} post={post} />)}</div><Pagination meta={posts.meta} basePath={`/blog/category/${slug}`} /></> : <EmptyState title="لا توجد مقالات منشورة" description="لا يحتوي هذا التصنيف على مقالات منشورة حاليًا." />}</Container></>;
}
