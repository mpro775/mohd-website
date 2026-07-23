import { apiRequest, normalizePaginated } from "./client";
import type {
  Category,
  Certification,
  ContactPayload,
  Education,
  Faq,
  LinkItem,
  PublicPostListItem,
  PublicPostDetail,
  Profile,
  Project,
  Service,
  Tag,
  Technology,
  PostNavigation,
  SeoEntry,
} from "./types";

type ListQuery = Record<string, string | number | boolean | undefined | null>;

export const publicApi = {
  profile: () => apiRequest<Profile>("/public/profile", { next: { revalidate: 300, tags: ["profile"] } }).then((r) => r.data),
  projects: async (query?: ListQuery) => {
    const r = await apiRequest<Project[], import("./types").PaginationMeta>("/public/projects", {
      query,
      next: { revalidate: 120, tags: ["projects"] },
    });
    return normalizePaginated<Project>(r.data, r.meta);
  },
  project: (slug: string) => apiRequest<Project>(`/public/projects/${slug}`, { next: { revalidate: 120, tags: ["projects"] } }).then((r) => r.data),
  posts: async (query?: ListQuery) => {
    const normalized = {
      ...query,
      categorySlug: query?.categorySlug ?? query?.category,
      tagSlug: query?.tagSlug ?? query?.tag,
      category: undefined,
      tag: undefined,
    };
    const r = await apiRequest<PublicPostListItem[], import("./types").PaginationMeta>("/public/blog/posts", {
      query: normalized,
      next: { revalidate: 120, tags: ["blog", "blog:list"] },
    });
    return normalizePaginated<PublicPostListItem>(r.data, r.meta);
  },
  post: (slug: string) => apiRequest<PublicPostDetail>(`/public/blog/posts/${slug}`, { next: { revalidate: 120, tags: ["blog", `blog:post:${slug}`] } }).then((r) => r.data),
  relatedPosts: (slug: string) => apiRequest<PublicPostListItem[]>(`/public/blog/posts/${slug}/related`, { next: { revalidate: 120, tags: ["blog", `blog:post:${slug}`] } }).then((r) => r.data ?? []),
  postNavigation: (slug: string) => apiRequest<PostNavigation>(`/public/blog/posts/${slug}/navigation`, { next: { revalidate: 120, tags: ["blog", `blog:post:${slug}`] } }).then((r) => r.data),
  trackPostView: (id: string, body: { sessionId?: string; referrer?: string }) => apiRequest(`/public/blog/posts/${id}/view`, { method: "POST", body }),
  categories: () => apiRequest<Category[]>("/public/blog/categories", { next: { revalidate: 300, tags: ["blog", "blog:list"] } }).then((r) => r.data ?? []),
  category: (slug: string) => apiRequest<Category>(`/public/blog/categories/${slug}`, { next: { revalidate: 300, tags: ["blog", `blog:category:${slug}`] } }).then((r) => r.data),
  tags: () => apiRequest<Tag[]>("/public/blog/tags", { next: { revalidate: 300, tags: ["blog", "blog:list"] } }).then((r) => r.data ?? []),
  tag: (slug: string) => apiRequest<Tag>(`/public/blog/tags/${slug}`, { next: { revalidate: 300, tags: ["blog", `blog:tag:${slug}`] } }).then((r) => r.data),
  seoEntries: async (page = 1, limit = 200) => {
    const r = await apiRequest<SeoEntry[], import("./types").PaginationMeta>("/public/seo/entries", { query: { page, limit }, next: { revalidate: 300, tags: ["blog:sitemap", "blog:rss"] } });
    return normalizePaginated<SeoEntry>(r.data, r.meta);
  },
  services: () => apiRequest<Service[]>("/public/services", { next: { revalidate: 300, tags: ["services"] } }).then((r) => r.data ?? []),
  service: (slug: string) => apiRequest<Service>(`/public/services/${slug}`, { next: { revalidate: 300, tags: ["services"] } }).then((r) => r.data),
  technologies: () => apiRequest<Technology[]>("/public/technologies", { next: { revalidate: 300, tags: ["technologies"] } }).then((r) => r.data ?? []),
  technology: (slug: string) => apiRequest<Technology>(`/public/technologies/${slug}`, { next: { revalidate: 300, tags: ["technologies"] } }).then((r) => r.data),
  links: () => apiRequest<LinkItem[]>("/public/links", { next: { revalidate: 300, tags: ["links"] } }).then((r) => r.data ?? []),
  link: (slug: string) => apiRequest<LinkItem>(`/public/links/${slug}`, { next: { revalidate: 300, tags: ["links"] } }).then((r) => r.data),
  trackLink: (id: string) => apiRequest(`/public/links/${id}/click`, { method: "POST" }),
  clients: () => apiRequest<import("./types").Client[]>("/public/clients", { next: { revalidate: 300, tags: ["clients"] } }).then((r) => r.data ?? []),
  faqs: async (query?: ListQuery) => {
    const r = await apiRequest<Faq[], import("./types").PaginationMeta>("/public/faqs", { query, next: { revalidate: 300, tags: ["faqs"] } });
    return normalizePaginated<Faq>(r.data, r.meta);
  },
  certifications: async (query?: ListQuery) => {
    const r = await apiRequest<Certification[], import("./types").PaginationMeta>(
      "/public/certifications",
      { query, next: { revalidate: 300, tags: ["certifications"] } },
    );
    return normalizePaginated<Certification>(r.data, r.meta);
  },
  certification: (slug: string) =>
    apiRequest<Certification>(`/public/certifications/${slug}`, {
      next: {
        revalidate: 300,
        tags: ["certifications", `certification:${slug}`],
      },
    }).then((r) => r.data),
  education: async (query?: ListQuery) => {
    const r = await apiRequest<Education[], import("./types").PaginationMeta>(
      "/public/education",
      { query, next: { revalidate: 300, tags: ["education"] } },
    );
    return normalizePaginated<Education>(r.data, r.meta);
  },
  educationItem: (slug: string) =>
    apiRequest<Education>(`/public/education/${slug}`, {
      next: { revalidate: 300, tags: ["education", `education:${slug}`] },
    }).then((r) => r.data),
  contact: (body: ContactPayload) => apiRequest("/public/contact", { method: "POST", body }),
};
