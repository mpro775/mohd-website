import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Calendar, Clock, Eye } from "lucide-react";
import { Container } from "@/components/common/Container";
import { JsonLd } from "@/components/common/JsonLd";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { AuthorCard } from "@/features/blog/components/AuthorCard";
import { PostNavigation } from "@/features/blog/components/PostNavigation";
import { PostViewTracker } from "@/features/blog/components/PostViewTracker";
import { ReadingProgress } from "@/features/blog/components/ReadingProgress";
import { RelatedPosts } from "@/features/blog/components/RelatedPosts";
import { ShareActions } from "@/features/blog/components/ShareActions";
import { TableOfContents } from "@/features/blog/components/TableOfContents";
import { extractHeadings } from "@/features/blog/utils/blog-markdown";
import { publicApi } from "@/lib/api/public";
import type { Post } from "@/lib/api/types";
import { buildPostMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, postJsonLd } from "@/lib/seo/structured-data";
import { formatDate } from "@/lib/utils";

function category(post: Post) { return typeof post.category === "object" ? post.category : null; }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await publicApi.post(slug).catch(() => null);
  return post ? buildPostMetadata(post) : {};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await publicApi.post(slug).catch(() => null);
  if (!post) notFound();
  if (post.redirectRequired && post.canonicalSlug && post.canonicalSlug !== slug) permanentRedirect(`/blog/${post.canonicalSlug}`);
  const [related, navigation] = await Promise.all([publicApi.relatedPosts(post.slug).catch(() => []), publicApi.postNavigation(post.slug).catch(() => undefined)]);
  const image = post.coverImage ?? post.featuredImage ?? "/brand/og-fallback.svg";
  const headings = extractHeadings(post.content);
  const currentCategory = category(post);
  return <><ReadingProgress /><PostViewTracker postId={String(post.id ?? post._id)} /><JsonLd data={postJsonLd(post)} /><JsonLd data={breadcrumbJsonLd([{ name: "الرئيسية", item: "/" }, { name: "المدونة", item: "/blog" }, { name: post.title, item: `/blog/${post.slug}` }])} /><Container className="py-10"><nav aria-label="مسار التنقل" className="mb-6 flex flex-wrap gap-2 text-xs text-muted-foreground"><Link href="/">الرئيسية</Link><span>/</span><Link href="/blog">المدونة</Link>{currentCategory ? <><span>/</span><Link href={`/blog/category/${currentCategory.slug}`}>{currentCategory.name}</Link></> : null}<span>/</span><span>{post.title}</span></nav><header className="mx-auto max-w-4xl text-center">{currentCategory ? <Link href={`/blog/category/${currentCategory.slug}`} className="text-sm font-bold text-primary">{currentCategory.name}</Link> : null}<h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">{post.title}</h1><p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{post.summary}</p><div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground"><span>{typeof post.author === "object" ? post.author.name : "Mohd"}</span><span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(post.publishedAt)}</span>{post.updatedAt && post.updatedAt !== post.publishedAt ? <span>آخر تحديث {formatDate(post.updatedAt)}</span> : null}<span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{post.readTime ?? 1} دقائق</span><span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" />{post.viewCount ?? 0} مشاهدة</span></div></header><div className="relative mx-auto mt-10 aspect-video max-w-6xl overflow-hidden rounded-2xl border border-border bg-muted"><Image src={image} alt={post.coverImageMedia?.alt || post.featuredImageMedia?.alt || post.title} fill priority sizes="(min-width: 1280px) 1152px, 100vw" className="object-cover" /></div><div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]"><main className="min-w-0 space-y-8"><details className="premium-card p-4 lg:hidden"><summary className="font-bold">جدول المحتويات</summary><div className="mt-4"><TableOfContents headings={headings} /></div></details><div className="premium-card p-5 md:p-9"><MarkdownRenderer content={post.content} /><div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">{post.tags?.map((tag) => typeof tag === "object" ? <Link key={tag.slug} href={`/blog/tag/${tag.slug}`} className="rounded-full border border-border px-3 py-1 text-sm hover:text-primary">#{tag.name}</Link> : null)}</div><div className="mt-6"><ShareActions title={post.title} /></div></div><AuthorCard author={post.author} /><PostNavigation navigation={navigation} /></main><aside className="hidden lg:block"><div className="sticky top-24 premium-card p-5"><h2 className="mb-4 font-bold">جدول المحتويات</h2><TableOfContents headings={headings} /></div></aside></div><div className="mt-14"><RelatedPosts posts={related} /></div></Container></>;
}
