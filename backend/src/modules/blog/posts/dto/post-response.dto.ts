import type { PostStatus } from '../schemas/post.schema';

export interface PostPublicListItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  excerpt?: string;
  publishedAt?: Date;
  updatedAt?: Date;
  readTime: number;
  viewCount?: number;
  isFeatured: boolean;
}

export interface PostPublicDetail extends PostPublicListItem {
  content: string;
  contentFormat: 'markdown';
  allowIndexing: boolean;
  canonicalUrl?: string;
}

export interface PostAdminListItem extends PostPublicListItem {
  status: PostStatus;
  scheduledAt?: Date;
  version: number;
  deletedAt?: Date;
}

export interface PostAdminDetail extends PostPublicDetail {
  previousSlugs: string[];
  contentVersion: number;
  version: number;
  contentHash: string;
  status: PostStatus;
}
