import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { SeoFields } from "@/lib/api/types";
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
