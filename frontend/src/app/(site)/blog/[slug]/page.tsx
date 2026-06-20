import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, Eye } from "lucide-react";
import { Container } from "@/components/common/Container";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { PageHeader } from "@/components/common/PageHeader";
import { TechStackBadge } from "@/components/common/TechStackBadge";
import { publicApi } from "@/lib/api/public";
import type { Post } from "@/lib/api/types";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, postJsonLd } from "@/lib/seo/structured-data";
import { formatDate } from "@/lib/utils";

function getCategoryName(category: Post["category"]) {
  if (!category) return "Engineering Notes";
  return typeof category === "string" ? category : category.name;
}

function getTagName(tag: unknown) {
  if (!tag) return "";
  return typeof tag === "string" ? tag : (tag as { name?: string }).name ?? "";
}

function headings(content: string) {
  return content
    .split("\n")
    .filter((line) => /^#{2,3}\s+/.test(line))
    .map((line) => line.replace(/^#{2,3}\s+/, "").trim())
    .slice(0, 8);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await publicApi.post(slug).catch(() => null);
  if (!post) return {};
  return buildMetadata(post.title, post.summary, post.seo, post.allowIndexing === false, `/blog/${slug}`);
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, profile, posts] = await Promise.all([
    publicApi.post(slug).catch(() => null),
    publicApi.profile().catch(() => null),
    publicApi.posts({ limit: 6 }).catch(() => ({ items: [], meta: undefined })),
  ]);

  if (!post) notFound();

  const image = post.featuredImage ?? post.coverImage ?? "/brand/og-fallback.svg";
  const toc = headings(post.content);
  const related = posts.items.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd(post)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "الرئيسية", item: "/" },
              { name: "المقالات", item: "/blog" },
              { name: post.title, item: `/blog/${slug}` },
            ]),
          ),
        }}
      />
      <PageHeader title={post.title} description={post.summary} eyebrow={getCategoryName(post.category)} routeLabel={`~/blog/${post.slug}.md`} />

      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_280px]">
        <article className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/40 pb-4 font-mono text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" />{formatDate(post.publishDate)}</span>
            {post.readTime ? <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />{post.readTime} دقائق قراءة</span> : null}
            {post.views !== undefined ? <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-primary" />{post.views} مشاهدة</span> : null}
          </div>

          <div className="relative mb-8 aspect-video overflow-hidden rounded-xl border border-border bg-muted">
            <Image src={image} alt={post.title} fill priority className="object-cover" />
          </div>

          <div className="premium-card p-6 md:p-8">
            <MarkdownRenderer content={post.content} />

            {post.tags?.length ? (
              <div className="mt-8 flex flex-wrap gap-1.5 border-t border-border/40 pt-6">
                {post.tags.slice(0, 6).map((tag, idx) => (
                  <TechStackBadge key={`tag-${idx}`} name={getTagName(tag)} />
                ))}
              </div>
            ) : null}

            <div className="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm leading-7 text-muted-foreground">
                كتبت هذه الملاحظة كجزء من توثيق رحلتي في بناء منتجات رقمية أفضل.
              </p>
              <p className="mt-3 font-semibold text-foreground">{profile?.fullName ?? "Mohd"}</p>
            </div>
          </div>

          {related.length ? (
            <section className="mt-8 premium-card p-6">
              <h2 className="mb-4 text-xl font-bold text-foreground">Related posts</h2>
              <div className="grid gap-3">
                {related.map((item) => (
                  <a key={item.slug} href={`/blog/${item.slug}`} className="rounded-lg border border-border p-4 transition hover:border-primary/40">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 premium-card p-5">
            <h2 dir="ltr" className="font-mono text-sm font-bold text-primary">Table of contents</h2>
            {toc.length ? (
              <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
                {toc.map((title) => (
                  <li key={title} className="leading-6">{title}</li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">لا توجد عناوين داخلية كافية.</p>
            )}
          </div>
        </aside>
      </Container>
    </>
  );
}
