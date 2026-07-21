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

export type ResolvedMedia = {
  id: string;
  key?: string;
  url: string;
  alt?: string;
  type: 'image' | 'document';
  folder: string;
  mimeType: string;
  width?: number;
  height?: number;
};

export type SeoFields = {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  ogImageMediaId?: string;
  ogImageMedia?: ResolvedMedia;
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
  profileImageMediaId?: string;
  profileImageMedia?: ResolvedMedia;
  profileImageAlt?: string;
  cvFile?: string;
  cvMediaId?: string;
  cvMedia?: ResolvedMedia;
  email: string;
  phone?: string;
  location?: string;
  availableForWork: boolean;
  languages: { name: string; level?: string }[];
  yearsOfExperience?: number;
  seo?: SeoFields;
};

export type CertificationType =
  | "course"
  | "specialization"
  | "professional-certificate"
  | "professional-certification"
  | "license"
  | "bootcamp"
  | "workshop"
  | "attendance"
  | "diploma"
  | "award"
  | "other";

export type CertificationValidityStatus =
  | "no-expiry"
  | "active"
  | "expired"
  | "unknown";

export type Certification = {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  type: CertificationType;
  issuer: string;
  platform?: string;
  platformUrl?: string;
  description?: string;
  credentialId?: string;
  credentialUrl?: string;
  issuedAt?: string;
  expiresAt?: string;
  doesNotExpire: boolean;
  validityStatus?: CertificationValidityStatus;
  imageMediaId?: string;
  image?: string;
  imageMedia?: ResolvedMedia;
  documentMediaId?: string;
  document?: string;
  documentMedia?: ResolvedMedia;
  issuerLogoMediaId?: string;
  issuerLogo?: string;
  issuerLogoMedia?: ResolvedMedia;
  skills?: string[];
  category?: string;
  language?: string;
  durationHours?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
  order?: number;
  seo?: SeoFields;
  createdAt?: string;
  updatedAt?: string;
};

export type EducationDegreeType =
  | "high-school"
  | "diploma"
  | "associate"
  | "bachelor"
  | "master"
  | "doctorate"
  | "postgraduate"
  | "professional-degree"
  | "other";

export type Education = {
  id?: string;
  _id?: string;
  institution: string;
  slug: string;
  degree: string;
  degreeType: EducationDegreeType;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  grade?: string;
  description?: string;
  location?: string;
  institutionUrl?: string;
  institutionLogoMediaId?: string;
  institutionLogo?: string;
  institutionLogoMedia?: ResolvedMedia;
  coverImageMediaId?: string;
  coverImage?: string;
  coverImageMedia?: ResolvedMedia;
  certificateMediaId?: string;
  certificate?: string;
  certificateMedia?: ResolvedMedia;
  achievements?: string[];
  isFeatured?: boolean;
  isPublished?: boolean;
  order?: number;
  seo?: SeoFields;
  createdAt?: string;
  updatedAt?: string;
};

export type Project = {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  detailedDescription?: string;
  coverImageMediaId?: string;
  coverImage?: string;
  coverImageMedia?: ResolvedMedia;
  galleryMediaIds?: string[];
  gallery?: string[];
  galleryMedia?: ResolvedMedia[];
  technologySlugs?: string[];
  technologies?: Array<{
    name: string;
    slug: string;
    icon?: string;
    iconMediaId?: string;
    category?: string;
    group?: string;
    color?: string;
  }>;
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
  postCount?: number;
  imageMediaId?: string;
  order?: number;
  seo?: SeoFields;
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
  featuredImageMediaId?: string;
  featuredImage?: string;
  featuredImageMedia?: ResolvedMedia;
  coverImageMediaId?: string;
  coverImage?: string;
  coverImageMedia?: ResolvedMedia;
  category?: Category | string;
  tags?: Array<Tag | string>;
  relatedPostIds?: string[];
  previousSlugs?: string[];
  contentFormat?: "markdown";
  contentVersion?: number;
  version?: number;
  contentHash?: string;
  contentMediaIds?: string[];
  author?: { id?: string; name?: string; title?: string; avatar?: string } | string;
  reviewer?: { id?: string; name?: string };
  publisher?: { id?: string; name?: string };
  firstPublishedAt?: string;
  publishedAt?: string;
  lastPublishedAt?: string;
  scheduledAt?: string;
  status?: "draft" | "in_review" | "changes_requested" | "approved" | "scheduled" | "published" | "archived";
  viewCount?: number;
  uniqueViewCount?: number;
  readTime?: number;
  isFeatured?: boolean;
  featuredOrder?: number;
  allowIndexing?: boolean;
  canonicalUrl?: string;
  seo?: SeoFields;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  canonicalSlug?: string;
  redirectRequired?: boolean;
};

export type PostRevision = {
  _id?: string;
  id?: string;
  revisionNumber: number;
  version: number;
  reason: "manual_save" | "autosave" | "publish" | "schedule" | "restore" | "migration";
  snapshot?: Partial<Post>;
  contentHash: string;
  createdBy?: { name?: string; email?: string };
  createdAt: string;
};

export type ReadinessResult = {
  ready: boolean;
  blockers: Array<{ code: string; message: string }>;
  warnings: Array<{ code: string; message: string }>;
  checks: Array<{ code: string; passed: boolean }>;
};

export type PostNavigation = {
  previous?: { title: string; slug: string } | null;
  next?: { title: string; slug: string } | null;
};

export type SeoEntry = {
  type: "post" | "category" | "tag";
  path: string;
  lastModified: string;
  publishedAt?: string;
  title?: string;
  description?: string;
};

export type Service = {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  shortDescription: string;
  detailedDescription?: string;
  iconMediaId?: string;
  icon?: string;
  iconMedia?: ResolvedMedia;
  category?: string;
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
  iconMediaId?: string;
  icon?: string;
  iconMedia?: ResolvedMedia;
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
  iconMediaId?: string;
  icon?: string;
  iconMedia?: ResolvedMedia;
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
