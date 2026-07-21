import type { MetadataRoute } from "next";
import { publicApi } from "@/lib/api/public";
import { absoluteUrl } from "@/lib/utils";
import type { Certification, Education, Project, SeoEntry } from "@/lib/api/types";

async function collect<T>(loader: (page: number) => Promise<{ items: T[]; meta: { hasNextPage: boolean } }>): Promise<T[]> { const items: T[] = []; for (let page = 1; ; page += 1) { const result = await loader(page); items.push(...result.items); if (!result.meta.hasNextPage) return items; } }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, blogEntries, services, technologies, certifications, education] = await Promise.all([
    collect<Project>((page) => publicApi.projects({ page, limit: 100 })).catch(() => []),
    collect<SeoEntry>((page) => publicApi.seoEntries(page, 200)).catch(() => []),
    publicApi.services().catch(() => []),
    publicApi.technologies().catch(() => []),
    collect<Certification>((page) => publicApi.certifications({ page, limit: 100 })).catch(() => []),
    collect<Education>((page) => publicApi.education({ page, limit: 100 })).catch(() => []),
  ]);
  const staticPaths = ["", "about", "projects", "services", "technologies", "certifications", "education", "blog", "contact", "links", "faqs"];
  return [
    ...staticPaths.map((path) => ({ url: absoluteUrl(path) })),
    ...projects.map((item) => ({ url: absoluteUrl(`projects/${item.slug}`), lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined })),
    ...blogEntries.map((item) => ({ url: absoluteUrl(item.path), lastModified: new Date(item.lastModified) })),
    ...services.map((item) => ({ url: absoluteUrl(`services/${item.slug}`) })),
    ...technologies.map((item) => ({ url: absoluteUrl(`technologies/${item.slug}`) })),
    ...certifications.map((item) => ({ url: absoluteUrl(`certifications/${item.slug}`), lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined })),
    ...education.map((item) => ({ url: absoluteUrl(`education/${item.slug}`), lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined })),
  ];
}
