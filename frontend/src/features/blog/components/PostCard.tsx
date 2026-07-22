import Image from "next/image";
import Link from "next/link";
import type { Category, PublicPostListItem } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

function category(value: PublicPostListItem["category"]): Category | null { return value && typeof value === "object" ? value : null; }

export function PostCard({ post, featured = false }: { post: PublicPostListItem; featured?: boolean }) {
  const image = post.featuredImage ?? "/brand/og-fallback.svg";
  const currentCategory = category(post.category);
  return <article className={`premium-card group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:border-primary/40 ${featured ? "md:grid md:grid-cols-[1.1fr_1fr]" : ""}`}><Link href={`/blog/${post.slug}`} className="block"><div className={`relative overflow-hidden bg-muted ${featured ? "h-full min-h-64" : "aspect-video"}`}><Image src={image} alt={post.featuredImageMedia?.alt || post.title} fill sizes={featured ? "(min-width: 768px) 55vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"} priority={featured} className="object-cover transition-transform duration-500 group-hover:scale-105" />{post.isFeatured ? <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">مقال مميز</span> : null}</div></Link><div className="flex flex-1 flex-col gap-3 p-5">{currentCategory ? <Link href={`/blog/category/${currentCategory.slug}`} className="text-xs font-bold text-primary">{currentCategory.name}</Link> : null}<Link href={`/blog/${post.slug}`} className={`${featured ? "text-3xl" : "text-xl"} font-black hover:text-primary`}>{post.title}</Link><p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{post.summary ?? post.excerpt}</p><div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground"><span>{formatDate(post.publishedAt)}</span>{post.readTime ? <span>· {post.readTime} دقائق قراءة</span> : null}{post.viewCount !== undefined ? <span>· {post.viewCount} مشاهدة</span> : null}</div>{post.tags?.length ? <div className="flex flex-wrap gap-1.5">{post.tags.slice(0, 4).map((tag) => typeof tag === "object" ? <Link key={tag.slug} href={`/blog/tag/${tag.slug}`} className="rounded-full border border-border px-2 py-1 text-[11px] hover:text-primary">#{tag.name}</Link> : null)}</div> : null}</div></article>;
}
