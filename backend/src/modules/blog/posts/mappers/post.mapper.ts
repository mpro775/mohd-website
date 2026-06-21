import { Post } from '../schemas/post.schema';
import { MediaService } from '../../../media/media.service';

export async function mapPostToPublic(post: Post, mediaService: MediaService) {
  const featuredImage = await mediaService.resolveMediaUrl(post.featuredImageMediaId);
  const coverImage = await mediaService.resolveMediaUrl(post.coverImageMediaId);
  const ogImage = await mediaService.resolveMediaUrl(post.seo?.ogImageMediaId);

  return {
    id: post._id.toString(),
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    excerpt: post.excerpt,
    content: post.content,
    featuredImage,
    coverImage,
    category: post.category,
    tags: post.tags,
    author: post.author,
    publishDate: post.publishDate,
    status: post.status,
    views: post.views,
    readTime: post.readTime,
    isFeatured: post.isFeatured,
    allowIndexing: post.allowIndexing,
    canonicalUrl: post.canonicalUrl,
    seo: {
      metaTitle: post.seo?.metaTitle,
      metaDescription: post.seo?.metaDescription,
      ogImage,
    },
    createdAt: post.createdAt,
  };
}

export async function mapPostToAdmin(post: Post, mediaService: MediaService) {
  const featuredImage = await mediaService.resolveMediaUrl(post.featuredImageMediaId);
  const featuredImageMedia = await mediaService.resolveMediaObject(post.featuredImageMediaId);
  const coverImage = await mediaService.resolveMediaUrl(post.coverImageMediaId);
  const coverImageMedia = await mediaService.resolveMediaObject(post.coverImageMediaId);
  const ogImage = await mediaService.resolveMediaUrl(post.seo?.ogImageMediaId);
  const ogImageMedia = await mediaService.resolveMediaObject(post.seo?.ogImageMediaId);

  return {
    id: post._id.toString(),
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    excerpt: post.excerpt,
    content: post.content,
    featuredImageMediaId: post.featuredImageMediaId?.toString(),
    featuredImage,
    featuredImageMedia,
    coverImageMediaId: post.coverImageMediaId?.toString(),
    coverImage,
    coverImageMedia,
    category: post.category,
    tags: post.tags,
    author: post.author,
    publishDate: post.publishDate,
    scheduledAt: post.scheduledAt,
    lastPublishedAt: post.lastPublishedAt,
    updatedDate: post.updatedDate,
    status: post.status,
    views: post.views,
    readTime: post.readTime,
    isFeatured: post.isFeatured,
    allowIndexing: post.allowIndexing,
    canonicalUrl: post.canonicalUrl,
    seo: {
      metaTitle: post.seo?.metaTitle,
      metaDescription: post.seo?.metaDescription,
      ogImageMediaId: post.seo?.ogImageMediaId?.toString(),
      ogImage,
      ogImageMedia,
    },
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}
