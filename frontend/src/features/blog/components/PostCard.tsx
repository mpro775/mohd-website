import Image from "next/image";
import Link from "next/link";
import type { Post, Category } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";
import { TechStackBadge } from "@/components/common/TechStackBadge";

function categoryName(category: Post["category"]) {
  if (!category) return "";
  return typeof category === "string" ? category : (category as Category).name;
}

function tagName(tag: any) {
  if (!tag) return "";
  return typeof tag === "string" ? tag : tag.name;
}

export function PostCard({ post }: { post: Post }) {
  const image = post.featuredImage ?? post.coverImage;
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_16px_48px_-16px_rgba(55,211,153,0.15)] flex flex-col h-full justify-between">
      <div>
        <Link href={`/blog/${post.slug}`} className="block">
          <div className="relative aspect-video overflow-hidden bg-muted">
            {image ? (
              <>
                <Image 
                  src={image} 
                  alt={post.title} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                {/* Shimmer overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer" />
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary rounded-full border border-primary/30 bg-background/80 backdrop-blur-sm px-3 py-1.5" dir="ltr">
                    {"// Read Article "} &rarr;
                  </span>
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col justify-between bg-gradient-to-br from-[#071019] to-card p-4 font-mono text-[10px] text-muted-foreground/60 transition-colors duration-300 group-hover:text-primary/80 border-b border-border/40 select-none">
                <div className="flex items-center justify-between border-b border-border/20 pb-1.5">
                  <span>blog/{post.slug}.md</span>
                  <span className="h-2 w-2 rounded-full bg-primary/40" />
                </div>
                <div className="py-6 text-left font-mono text-xs" dir="ltr">
                  <p className="text-primary/80"># {post.title.substring(0, 30)}...</p>
                  <p className="text-muted-foreground/50 text-[10px] mt-2">{"// Click to read article"}</p>
                </div>
                <div className="border-t border-border/20 pt-1 text-left text-[9px]">
                  {"// Markdown Document"}
                </div>
              </div>
            )}
          </div>
        </Link>
        <div className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground font-mono">
            {post.category && (
              <span className="text-primary font-semibold">{categoryName(post.category)}</span>
            )}
            <span className="text-muted-foreground/30">•</span>
            <span>{formatDate(post.publishDate)}</span>
            {post.readTime ? (
              <>
                <span className="text-muted-foreground/30">•</span>
                <span>{post.readTime} دقائق قراءة</span>
              </>
            ) : null}
          </div>
          <Link href={`/blog/${post.slug}`} className="block text-xl font-bold transition-colors duration-200 hover:text-primary group-hover:text-primary/95">
            {post.title}
          </Link>
          <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{post.summary ?? post.excerpt}</p>
        </div>
      </div>

      {post.tags?.length ? (
        <div className="flex flex-wrap gap-1.5 p-5 pt-0">
          {post.tags.slice(0, 3).map((tag, idx) => (
            <TechStackBadge key={`${post.slug}-tag-${idx}`} name={tagName(tag)} />
          ))}
        </div>
      ) : null}
    </article>
  );
}
