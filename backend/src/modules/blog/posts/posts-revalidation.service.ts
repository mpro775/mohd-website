import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostsRevalidationService {
  private readonly logger = new Logger(PostsRevalidationService.name);

  constructor(private readonly config: ConfigService) {}

  async revalidate(tags: string[]): Promise<void> {
    const url = this.config.get<string>('FRONTEND_REVALIDATE_URL');
    const secret = this.config.get<string>('FRONTEND_REVALIDATE_SECRET');
    const uniqueTags = [...new Set(tags.filter(Boolean))];
    if (!url || !secret || !uniqueTags.length) return;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-revalidation-secret': secret,
        },
        body: JSON.stringify({ tags: uniqueTags }),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.logger.log(
        JSON.stringify({
          event: 'blog.revalidation.success',
          tags: uniqueTags,
        }),
      );
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          event: 'blog.revalidation.failure',
          tags: uniqueTags,
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
