import Image from "next/image";
import Link from "next/link";
import type { Category, Post } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";
import { TechStackBadge } from "@/components/common/TechStackBadge";

function categoryName(category: Post["category"]) {
  if (!category) return "Engineering";
  return typeof category === "string" ? category : (category as Category).name;
}

function tagName(tag: unknown) {
  if (!tag) return "";
  return typeof tag === "string" ? tag : (tag as { name?: string }).name ?? "";
}

export function PostCard({ post }: { post: Post }) {
  const image = post.featuredImage ?? post.coverImage ?? "/brand/og-fallback.svg";

  return (
    <article className="premium-card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image src={image} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
          <span className="absolute right-3 top-3 rounded-full border border-primary/30 bg-background/80 px-3 py-1 font-mono text-[10px] text-primary">
            Engineering Notes
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="text-primary">{categoryName(post.category)}</span>
          <span>/</span>
          <span>{formatDate(post.publishDate)}</span>
          {post.readTime ? <span>{post.readTime} دقائق قراءة</span> : null}
          {post.views !== undefined ? <span>{post.views} views</span> : null}
        </div>
        <Link href={`/blog/${post.slug}`} className="text-xl font-bold text-foreground transition hover:text-primary">
          {post.title}
        </Link>
        <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{post.summary ?? post.excerpt}</p>
        {post.tags?.length ? (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
            {post.tags.slice(0, 4).map((tag, idx) => (
              <TechStackBadge key={`${post.slug}-tag-${idx}`} name={tagName(tag)} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
