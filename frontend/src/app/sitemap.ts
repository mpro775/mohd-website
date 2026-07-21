import type { MetadataRoute } from "next";
import { publicApi } from "@/lib/api/public";
import { absoluteUrl } from "@/lib/utils";
import type { Certification, Education } from "@/lib/api/types";

async function allCertifications(): Promise<Certification[]> {
  const items: Certification[] = [];
  for (let page = 1; ; page += 1) {
    const result = await publicApi.certifications({ page, limit: 100 });
    items.push(...result.items);
    if (!result.meta.hasNextPage) return items;
  }
}

async function allEducation(): Promise<Education[]> {
  const items: Education[] = [];
  for (let page = 1; ; page += 1) {
    const result = await publicApi.education({ page, limit: 100 });
    items.push(...result.items);
    if (!result.meta.hasNextPage) return items;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts, services, technologies, certifications, education] = await Promise.all([
    publicApi.projects({ limit: 100 }).catch(() => ({ items: [] })),
    publicApi.posts({ limit: 100 }).catch(() => ({ items: [] })),
    publicApi.services().catch(() => []),
    publicApi.technologies().catch(() => []),
    allCertifications().catch(() => []),
    allEducation().catch(() => []),
  ]);
  const staticEntries = [
    "", "about", "projects", "services", "technologies", "certifications", "education", "blog", "contact", "links", "faqs",
    ...projects.items.map((item) => `projects/${item.slug}`),
    ...posts.items.map((item) => `blog/${item.slug}`),
    ...services.map((item) => `services/${item.slug}`),
    ...technologies.map((item) => `technologies/${item.slug}`),
  ].map((path) => ({ url: absoluteUrl(path), lastModified: new Date() }));
  return [
    ...staticEntries,
    ...certifications.map((item) => ({ url: absoluteUrl(`certifications/${item.slug}`), lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date() })),
    ...education.map((item) => ({ url: absoluteUrl(`education/${item.slug}`), lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date() })),
  ];
}
