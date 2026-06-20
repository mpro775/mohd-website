export type ApiFieldError = {
  field?: string;
  message: string;
};

export type ApiResponse<T, M = unknown> = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: M;
  errors?: ApiFieldError[] | unknown[];
  timestamp: string;
  path: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  hasPrevPage?: boolean;
};

export type Paginated<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type SeoFields = {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
};

export type Profile = {
  id?: string;
  _id?: string;
  fullName: string;
  title: string;
  headline?: string;
  bio: string;
  about?: string;
  profileImage?: string;
  profileImageAlt?: string;
  cvFile?: string;
  email: string;
  phone?: string;
  location?: string;
  availableForWork: boolean;
  socialLinks: { platform: string; url: string; icon?: string; order?: number }[];
  languages: { name: string; level?: string }[];
  yearsOfExperience?: number;
  certificates: { title: string; issuer?: string; date?: string; url?: string }[];
  seo?: SeoFields;
};

export type Project = {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  detailedDescription?: string;
  images?: string[];
  coverImage?: string;
  gallery?: string[];
  technologies?: string[];
  liveUrl?: string;
  githubUrl?: string;
  completionDate?: string;
  status?: "completed" | "in-progress" | "paused";
  category?: string;
  order?: number;
  isPublished?: boolean;
  featured?: boolean;
  caseStudy?: string;
  problem?: string;
  solution?: string;
  results?: string;
  role?: string;
  seo?: SeoFields;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
};

export type Tag = Category & { color?: string };

export type Post = {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  summary: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  coverImage?: string;
  category?: Category | string;
  tags?: Array<Tag | string>;
  publishDate?: string;
  scheduledAt?: string;
  status?: "published" | "draft" | "scheduled" | "archived";
  views?: number;
  readTime?: number;
  isFeatured?: boolean;
  allowIndexing?: boolean;
  canonicalUrl?: string;
  seo?: SeoFields;
  createdAt?: string;
  updatedAt?: string;
};

export type Service = {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  shortDescription: string;
  detailedDescription?: string;
  icon?: string;
  startingPrice?: number;
  currency?: string;
  price?: string;
  duration?: string;
  deliverables?: string[];
  requirements?: string[];
  ctaText?: string;
  ctaUrl?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  order?: number;
  seo?: SeoFields;
};

export type Technology = {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  proficiencyLevel?: "beginner" | "intermediate" | "advanced" | "expert";
  category?: string;
  group?: string;
  officialUrl?: string;
  yearsOfExperience?: number;
  highlighted?: boolean;
  isPublished?: boolean;
  color?: string;
  order?: number;
};

export type LinkItem = {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  url: string;
  description?: string;
  icon?: string;
  platform?: string;
  category?: string;
  openInNewTab?: boolean;
  isFeatured?: boolean;
  isPublished?: boolean;
  clicks?: number;
  order?: number;
};

export type Faq = {
  id?: string;
  _id?: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  seo?: { metaTitle?: string; metaDescription?: string };
};

export type ContactPayload = {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export type DashboardStats = Record<string, number | string | unknown>;

export type MediaItem = {
  id?: string;
  _id?: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  folder: string;
  type: "image" | "document";
  alt?: string;
  usage?: string;
  isUsed?: boolean;
  createdAt?: string;
};
