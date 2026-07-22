import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostsRevalidationService {
  private readonly logger = new Logger(PostsRevalidationService.name);

  constructor(private readonly config: ConfigService) {}

  async revalidate(tags: string[], extraPaths: string[] = []): Promise<void> {
    const url = this.config.get<string>('FRONTEND_REVALIDATE_URL');
    const secret = this.config.get<string>('FRONTEND_REVALIDATE_SECRET');
    const uniqueTags = [...new Set(tags.filter(Boolean))];
    if (!url || !secret || (!uniqueTags.length && !extraPaths.length)) return;

    // Derive path revalidations from well-known tags
    const paths = [...extraPaths];
    if (uniqueTags.includes('blog:sitemap')) paths.push('/sitemap.xml');
    if (uniqueTags.includes('blog:rss')) paths.push('/rss.xml');
    const uniquePaths = [...new Set(paths.filter(Boolean))];

    const payload: { tags?: string[]; paths?: string[] } = {};
    if (uniqueTags.length) payload.tags = uniqueTags;
    if (uniquePaths.length) payload.paths = uniquePaths;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-revalidation-secret': secret,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.logger.log(
        JSON.stringify({
          event: 'blog.revalidation.success',
          tags: uniqueTags,
          paths: uniquePaths,
        }),
      );
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          event: 'blog.revalidation.failure',
          tags: uniqueTags,
          paths: uniquePaths,
          error: error instanceof Error ? error.message : 'unknown',
        }),
      );
    }
  }

  tagsForPost(post: any, oldSlug?: string): string[] {
    const tags = [
      'blog',
      'blog:list',
      'blog:featured',
      'blog:sitemap',
      'blog:rss',
      `blog:post:${post.slug}`,
      oldSlug ? `blog:post:${oldSlug}` : '',
    ];
    if (post.category?.slug) tags.push(`blog:category:${post.category.slug}`);
    for (const tag of post.tags ?? []) {
      if (tag?.slug) tags.push(`blog:tag:${tag.slug}`);
    }
    return tags.filter(Boolean);
  }
}
