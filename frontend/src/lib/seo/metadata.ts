import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { PublicPostDetail, SeoFields } from "@/lib/api/types";
import { absoluteUrl } from "@/lib/utils";

export function buildMetadata(
  title: string,
  description?: string,
  seo?: SeoFields,
  noIndex = false,
  path = ""
): Metadata {
  const resolvedTitle = seo?.metaTitle ?? title;
  const resolvedDescription = seo?.metaDescription ?? description ?? siteConfig.description;
  const resolvedImage = seo?.ogImage ?? undefined;
  
  return {
    title: resolvedTitle,
    description: resolvedDescription,
    robots: noIndex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: absoluteUrl(path),
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      images: resolvedImage ? [{ url: resolvedImage }] : undefined,
      type: "website",
      url: absoluteUrl(path),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
  };
}

export function buildPostMetadata(post: PublicPostDetail): Metadata {
  const resolvedTitle = post.seo?.metaTitle ?? post.title;
  const description = post.seo?.metaDescription ?? post.summary;
  const canonical = post.canonicalUrl || absoluteUrl(`/blog/${post.slug}`);
  const image = post.seo?.ogImage ?? post.featuredImage ?? post.coverImage;
  const authorName = typeof post.author === "object" ? post.author.name : undefined;
  const category = typeof post.category === "object" ? post.category.name : undefined;
  const tags = (post.tags ?? []).map((tag) => typeof tag === "object" ? tag.name : tag).filter(Boolean) as string[];
  return {
    title: resolvedTitle,
    description,
    alternates: { canonical },
    robots: post.allowIndexing === false ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "article",
      url: canonical,
      title: resolvedTitle,
      description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: authorName ? [authorName] : undefined,
      section: category,
      tags,
      images: image ? [{ url: image, alt: post.featuredImageMedia?.alt || post.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title: resolvedTitle, description, images: image ? [image] : undefined },
  };
}
