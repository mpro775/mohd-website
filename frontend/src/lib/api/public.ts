import { apiRequest, normalizePaginated } from "./client";
import type {
  Category,
  ContactPayload,
  Faq,
  LinkItem,
  Post,
  Profile,
  Project,
  Service,
  Tag,
  Technology,
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
    const r = await apiRequest<Post[], import("./types").PaginationMeta>("/public/blog/posts", {
      query: normalized,
      next: { revalidate: 120, tags: ["blog"] },
    });
    return normalizePaginated<Post>(r.data, r.meta);
  },
  post: (slug: string) => apiRequest<Post>(`/public/blog/posts/${slug}`, { next: { revalidate: 120, tags: ["blog"] } }).then((r) => r.data),
  categories: () => apiRequest<Category[]>("/public/blog/categories", { next: { revalidate: 300, tags: ["blog"] } }).then((r) => r.data ?? []),
  category: (slug: string) => apiRequest<Category>(`/public/blog/categories/${slug}`, { next: { revalidate: 300, tags: ["blog"] } }).then((r) => r.data),
  tags: () => apiRequest<Tag[]>("/public/blog/tags", { next: { revalidate: 300, tags: ["blog"] } }).then((r) => r.data ?? []),
  tag: (slug: string) => apiRequest<Tag>(`/public/blog/tags/${slug}`, { next: { revalidate: 300, tags: ["blog"] } }).then((r) => r.data),
  services: () => apiRequest<Service[]>("/public/services", { next: { revalidate: 300, tags: ["services"] } }).then((r) => r.data ?? []),
  service: (slug: string) => apiRequest<Service>(`/public/services/${slug}`, { next: { revalidate: 300, tags: ["services"] } }).then((r) => r.data),
  technologies: () => apiRequest<Technology[]>("/public/technologies", { next: { revalidate: 300, tags: ["technologies"] } }).then((r) => r.data ?? []),
  technology: (slug: string) => apiRequest<Technology>(`/public/technologies/${slug}`, { next: { revalidate: 300, tags: ["technologies"] } }).then((r) => r.data),
  links: () => apiRequest<LinkItem[]>("/public/links", { next: { revalidate: 300, tags: ["links"] } }).then((r) => r.data ?? []),
  link: (slug: string) => apiRequest<LinkItem>(`/public/links/${slug}`, { next: { revalidate: 300, tags: ["links"] } }).then((r) => r.data),
  trackLink: (id: string) => apiRequest(`/public/links/${id}/click`, { method: "POST" }),
  faqs: async (query?: ListQuery) => {
    const r = await apiRequest<Faq[], import("./types").PaginationMeta>("/public/faqs", { query, next: { revalidate: 300, tags: ["faqs"] } });
    return normalizePaginated<Faq>(r.data, r.meta);
  },
  contact: (body: ContactPayload) => apiRequest("/public/contact", { method: "POST", body }),
};
