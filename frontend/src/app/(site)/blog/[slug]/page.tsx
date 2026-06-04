import { notFound } from "next/navigation";
import Image from "next/image";
import { Eye, Calendar, Clock } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/common/Container";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { TechStackBadge } from "@/components/common/TechStackBadge";
import { publicApi } from "@/lib/api/public";
import { buildMetadata } from "@/lib/seo/metadata";
import { postJsonLd, breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { formatDate } from "@/lib/utils";

function getCategoryName(category: any) {
  if (!category) return "";
  return typeof category === "string" ? category : category.name;
}

function getTagName(tag: any) {
  if (!tag) return "";
  return typeof tag === "string" ? tag : tag.name;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await publicApi.post(slug).catch(() => null);
  if (!post) return {};
  return buildMetadata(post.title, post.summary, post.seo, post.allowIndexing === false, `/blog/${slug}`);
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, profile] = await Promise.all([
    publicApi.post(slug).catch(() => null),
    publicApi.profile().catch(() => null),
  ]);
  
  if (!post) notFound();

  const image = post.featuredImage ?? post.coverImage;
  const categoryName = getCategoryName(post.category);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd(post)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "الرئيسية", item: "/" },
              { name: "المدونة", item: "/blog" },
              { name: post.title, item: `/blog/${slug}` }
            ])
          )
        }}
      />
      <PageHeader 
        title={post.title} 
        description={post.summary}
        eyebrow={categoryName || "Article"}
        routeLabel={`~/blog/${post.slug}.md`}
      />

      <Container className="py-12 max-w-4xl">
        {/* Article header metadata */}
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/40 pb-4 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{formatDate(post.publishDate)}</span>
          </span>
          {post.readTime ? (
            <>
              <span className="text-muted-foreground/30">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>{post.readTime} دقائق قراءة</span>
              </span>
            </>
          ) : null}
          {post.views !== undefined && (
            <>
              <span className="text-muted-foreground/30">•</span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-primary" />
                <span>{post.views} مشاهدات</span>
              </span>
            </>
          )}
        </div>

        {/* Featured Image */}
        {image && (
          <div className="relative aspect-video md:aspect-[21/9] max-h-[400px] w-full overflow-hidden rounded-lg border border-border shadow-md mb-8">
            <Image
              src={image}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-6 md:p-8">
          <MarkdownRenderer content={post.content} />
          
          {/* Tags list */}
          {post.tags?.length ? (
            <div className="mt-8 pt-6 border-t border-border/40 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 5).map((tag, idx) => (
                <TechStackBadge key={`tag-${idx}`} name={getTagName(tag)} />
              ))}
            </div>
          ) : null}

          {/* Author Box */}
          <div className="mt-12 rounded-lg border border-border bg-card/60 p-6 flex flex-col sm:flex-row items-center gap-4">
            {profile?.profileImage ? (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border">
                <Image
                  src={profile.profileImage}
                  alt={profile.fullName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 font-bold text-primary">
                {profile?.fullName ? profile.fullName.charAt(0) : "M"}
              </div>
            )}
            
            <div className="text-center sm:text-right">
              <p className="text-xs font-mono text-primary font-bold">{"// AUTHOR"}</p>
              <h4 className="font-bold text-foreground mt-0.5">{profile?.fullName ?? "اسم المبرمج"}</h4>
              <p className="text-xs text-muted-foreground mt-1.5 leading-5">
                {profile?.headline ?? "مقالات وتجارب عملية حول بناء منتجات ويب قابلة للصيانة."}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
