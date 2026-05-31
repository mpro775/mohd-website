import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { SeoFields } from "@/lib/api/types";

export function buildMetadata(title: string, description?: string, seo?: SeoFields, noIndex = false): Metadata {
  const resolvedTitle = seo?.metaTitle ?? title;
  const resolvedDescription = seo?.metaDescription ?? description ?? siteConfig.description;
  return {
    title: resolvedTitle,
    description: resolvedDescription,
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      images: seo?.ogImage ? [seo.ogImage] : undefined,
      type: "website",
    },
  };
}
