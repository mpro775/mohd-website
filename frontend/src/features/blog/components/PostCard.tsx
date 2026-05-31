import Image from "next/image";
import Link from "next/link";
import type { Post, Category } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

function categoryName(category: Post["category"]) {
  if (!category) return "";
  return typeof category === "string" ? category : (category as Category).name;
}

export function PostCard({ post }: { post: Post }) {
  const image = post.featuredImage ?? post.coverImage;
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-video bg-muted">
          {image ? <Image src={image} alt={post.title} fill className="object-cover" /> : <div className="flex h-full items-center justify-center font-mono text-muted-foreground">blog/{post.slug}</div>}
        </div>
      </Link>
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="text-primary">{categoryName(post.category)}</span>
          <span>{formatDate(post.publishDate)}</span>
          {post.readTime ? <span>{post.readTime} دقائق قراءة</span> : null}
        </div>
        <Link href={`/blog/${post.slug}`} className="block text-xl font-bold hover:text-primary">
          {post.title}
        </Link>
        <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{post.summary ?? post.excerpt}</p>
      </div>
    </article>
  );
}
