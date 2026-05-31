import type { MetadataRoute } from "next";
import { publicApi } from "@/lib/api/public";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts, services, technologies] = await Promise.all([
    publicApi.projects({ limit: 100 }).catch(() => ({ items: [] })),
    publicApi.posts({ limit: 100 }).catch(() => ({ items: [] })),
    publicApi.services().catch(() => []),
    publicApi.technologies().catch(() => []),
  ]);
  return [
    "", "about", "projects", "services", "technologies", "blog", "contact", "links", "faqs",
    ...projects.items.map((item) => `projects/${item.slug}`),
    ...posts.items.map((item) => `blog/${item.slug}`),
    ...services.map((item) => `services/${item.slug}`),
    ...technologies.map((item) => `technologies/${item.slug}`),
  ].map((path) => ({ url: absoluteUrl(path), lastModified: new Date() }));
}
