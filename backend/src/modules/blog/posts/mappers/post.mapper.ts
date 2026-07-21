import type { ResolvedMedia } from '../../../media/media.service';

type PostLike = Record<string, any>;
type MediaMap = Map<string, ResolvedMedia>;

function id(value: any): string | undefined {
  if (!value) return undefined;
  return (value._id ?? value).toString();
}

function media(value: any, mediaMap: MediaMap): ResolvedMedia | undefined {
  const mediaId = id(value);
  return mediaId ? mediaMap.get(mediaId) : undefined;
}

function taxonomy(value: any) {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return {
    id: id(value),
    name: value.name,
    slug: value.slug,
    color: value.color,
  };
}

function author(value: any) {
  if (!value) return undefined;
  return {
    id: id(value),
    name: value.name,
    title: value.title,
    avatar: value.avatar,
  };
}

function base(post: PostLike, mediaMap: MediaMap) {
  const featuredImageMedia = media(post.featuredImageMediaId, mediaMap);
  return {
    id: id(post),
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    excerpt: post.excerpt,
    featuredImageMediaId: id(post.featuredImageMediaId),
    featuredImage: featuredImageMedia?.url,
    featuredImageMedia,
    category: taxonomy(post.category),
    tags: (post.tags ?? []).map(taxonomy),
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    readTime: post.readTime,
    viewCount: post.viewCount,
    isFeatured: post.isFeatured,
    featuredOrder: post.featuredOrder,
  };
}

export function mapPostToPublicListItem(post: PostLike, mediaMap: MediaMap) {
  return base(post, mediaMap);
}

export function mapPostToPublicDetail(post: PostLike, mediaMap: MediaMap) {
  const coverImageMedia = media(post.coverImageMediaId, mediaMap);
  const ogImageMedia = media(post.seo?.ogImageMediaId, mediaMap);
  return {
    ...base(post, mediaMap),
    content: post.content,
    contentFormat: post.contentFormat,
    coverImageMediaId: id(post.coverImageMediaId),
    coverImage: coverImageMedia?.url,
    coverImageMedia,
    contentMedia: (post.contentMediaIds ?? [])
      .map((item: any) => media(item, mediaMap))
      .filter(Boolean),
    author: author(post.author),
    allowIndexing: post.allowIndexing,
    canonicalUrl: post.canonicalUrl,
    seo: {
      metaTitle: post.seo?.metaTitle,
      metaDescription: post.seo?.metaDescription,
      ogImageMediaId: id(post.seo?.ogImageMediaId),
      ogImage: ogImageMedia?.url,
      ogImageMedia,
    },
    createdAt: post.createdAt,
  };
}

export function mapPostToAdminListItem(post: PostLike, mediaMap: MediaMap) {
  return {
    ...base(post, mediaMap),
    author: author(post.author),
    status: post.status,
    scheduledAt: post.scheduledAt,
    version: post.version,
    deletedAt: post.deletedAt,
  };
}

export function mapPostToAdminDetail(post: PostLike, mediaMap: MediaMap) {
  return {
    ...mapPostToPublicDetail(post, mediaMap),
    previousSlugs: post.previousSlugs ?? [],
    contentVersion: post.contentVersion,
    version: post.version,
    contentHash: post.contentHash,
    contentMediaIds: (post.contentMediaIds ?? []).map(id),
    relatedPostIds: (post.relatedPostIds ?? []).map(id),
    reviewer: author(post.reviewer),
    publisher: author(post.publisher),
    status: post.status,
    statusChangedAt: post.statusChangedAt,
    scheduledAt: post.scheduledAt,
    firstPublishedAt: post.firstPublishedAt,
    lastPublishedAt: post.lastPublishedAt,
    uniqueViewCount: post.uniqueViewCount,
    deletedAt: post.deletedAt,
  };
}
