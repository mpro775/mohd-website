import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  extractInternalMediaUrls,
  validateMarkdownPublishingContent,
} from '../../../common/utils/markdown-content.util';
import { MediaService } from '../../media/media.service';
import { Category } from '../categories/schemas/category.schema';
import { Post } from './schemas/post.schema';

export type ReadinessIssue = { code: string; message: string };

@Injectable()
export class PostReadinessService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    private readonly mediaService: MediaService,
    private readonly config: ConfigService,
  ) {}

  async check(postOrId: Post | string, expectedVersion?: number) {
    const post =
      typeof postOrId === 'string'
        ? await this.postModel.findById(postOrId)
        : postOrId;
    if (!post) throw new NotFoundException('المقال غير موجود');

    const blockers: ReadinessIssue[] = [];
    const warnings: ReadinessIssue[] = [];
    const checks: Array<{ code: string; passed: boolean }> = [];
    const block = (code: string, message: string) =>
      blockers.push({ code, message });
    const warn = (code: string, message: string) =>
      warnings.push({ code, message });

    if (!post.title || post.title.trim().length < 3)
      block('TITLE_INVALID', 'العنوان غير صالح');
    if (!post.slug || !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(post.slug))
      block('SLUG_INVALID', 'رابط المقال غير صالح');
    const duplicate = await this.postModel.exists({
      slug: post.slug,
      _id: { $ne: post._id },
    });
    if (duplicate) block('SLUG_DUPLICATE', 'رابط المقال مكرر');
    if (!post.summary || post.summary.trim().length < 20)
      block('SUMMARY_SHORT', 'الملخص أقصر من 20 حرفًا');
    try {
      validateMarkdownPublishingContent(post.content);
      if (post.content.trim().length < 100)
        block('CONTENT_SHORT', 'المحتوى قصير جدًا للنشر');
    } catch {
      block('CONTENT_INVALID', 'محتوى Markdown غير صالح');
    }
    const category = post.category
      ? await this.categoryModel.exists({
          _id: post.category,
          isActive: true,
          deletedAt: { $exists: false },
        })
      : null;
    if (!category) block('CATEGORY_INVALID', 'التصنيف غير موجود أو غير نشط');
    if (!post.featuredImageMediaId) {
      block('FEATURED_IMAGE_MISSING', 'الصورة البارزة مطلوبة');
    } else {
      try {
        const image = await this.mediaService.resolveMediaObject(
          post.featuredImageMediaId,
        );
        if (!image)
          block('FEATURED_IMAGE_MISSING', 'الصورة البارزة غير موجودة');
        else if (!image.alt?.trim())
          warn(
            'FEATURED_IMAGE_ALT_MISSING',
            'النص البديل للصورة البارزة مفقود',
          );
      } catch {
        block('FEATURED_IMAGE_MISSING', 'الصورة البارزة غير موجودة');
      }
    }

    const urls = extractInternalMediaUrls(post.content);
    const mediaIds = await this.mediaService.findIdsByUrls(urls);
    const internalBase = this.config
      .get<string>('R2_PUBLIC_URL')
      ?.replace(/\/$/, '');
    const internalUrls = urls.filter((url) =>
      internalBase ? url.startsWith(`${internalBase}/`) : url.startsWith('/'),
    );
    if (mediaIds.length < internalUrls.length)
      block('CONTENT_MEDIA_MISSING', 'توجد وسائط داخلية غير موجودة');

    if (expectedVersion !== undefined && post.version !== expectedVersion)
      block('VERSION_CONFLICT', 'نسخة المقال تغيرت');
    if (!post.seo?.metaTitle) warn('META_TITLE_MISSING', 'عنوان SEO مفقود');
    else if (post.seo.metaTitle.length > 60)
      warn('META_TITLE_LONG', 'عنوان SEO أطول من الموصى به');
    if (!post.seo?.metaDescription)
      warn('META_DESCRIPTION_MISSING', 'وصف SEO مفقود');
    else if (post.seo.metaDescription.length > 160)
      warn('META_DESCRIPTION_LONG', 'وصف SEO أطول من الموصى به');
    if (!/^##\s+/m.test(post.content)) warn('H2_MISSING', 'لا توجد عناوين H2');
    if (!/\[[^\]]+]\((?:\/|https?:\/\/[^)]+)\)/.test(post.content))
      warn('INTERNAL_LINKS_MISSING', 'لا توجد روابط داخلية');
    if (post.canonicalUrl) {
      const siteUrl = this.config.get<string>('SITE_URL');
      if (siteUrl && !post.canonicalUrl.startsWith(siteUrl))
        warn('CANONICAL_EXTERNAL', 'الرابط الأساسي يشير إلى نطاق خارجي');
    }
    if ((post.tags ?? []).length === 0) warn('TAGS_MISSING', 'لا توجد وسوم');
    if (!post.seo?.ogImageMediaId)
      warn('OG_IMAGE_MISSING', 'لا توجد صورة Open Graph مستقلة');

    for (const code of [
      'TITLE_INVALID',
      'SLUG_INVALID',
      'SUMMARY_SHORT',
      'CONTENT_INVALID',
      'CATEGORY_INVALID',
      'FEATURED_IMAGE_MISSING',
      'CONTENT_MEDIA_MISSING',
    ]) {
      checks.push({
        code,
        passed: !blockers.some((item) => item.code === code),
      });
    }
    return { ready: blockers.length === 0, blockers, warnings, checks };
  }
}
