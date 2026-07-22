import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  calculateContentHash,
  calculateMarkdownReadTime,
  extractInternalMediaUrls,
  normalizeMarkdownContent,
  validateMarkdownDraftContent,
} from '../../../common/utils/markdown-content.util';
import { sanitizePlainText } from '../../../common/utils/sanitize-content.util';
import { normalizeSlug } from '../../../common/utils/slug.util';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { MediaService } from '../../media/media.service';
import { Category } from '../categories/schemas/category.schema';
import { Tag } from '../tags/schemas/tag.schema';
import { CreatePostDraftDto } from './dto/create-post.dto';
import { RestoreRevisionDto } from './dto/restore-revision.dto';
import { UpdatePostContentDto } from './dto/update-post.dto';
import { PermanentDeletePostDto } from './dto/workflow-post.dto';
import { PostRevisionsService } from './post-revisions.service';
import { PostsRevalidationService } from './posts-revalidation.service';
import { PostSlugRedirect } from './redirects/schemas/post-slug-redirect.schema';
import { Post, PostStatus } from './schemas/post.schema';
import { PostRevision } from './revisions/schemas/post-revision.schema';
import { PostView } from './views/schemas/post-view.schema';

type RequestLike = { user?: { userId?: string; id?: string; _id?: string } };

@Injectable()
export class PostsCommandService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Tag.name) private readonly tagModel: Model<Tag>,
    @InjectModel(PostSlugRedirect.name)
    private readonly redirectModel: Model<PostSlugRedirect>,
    @InjectModel(PostRevision.name)
    private readonly revisionModel: Model<PostRevision>,
    @InjectModel(PostView.name)
    private readonly viewModel: Model<PostView>,
    private readonly mediaService: MediaService,
    private readonly revisions: PostRevisionsService,
    private readonly revalidation: PostsRevalidationService,
    private readonly audit: AuditLogsService,
  ) {}

  async create(dto: CreatePostDraftDto, authorId: string, req?: RequestLike) {
    const rawSlug = dto.slug || dto.title;
    const slug = rawSlug ? normalizeSlug(rawSlug) : undefined;
    if (slug) await this.assertSlugAvailable(slug);
    await this.validateRelations(dto.category, dto.tags, dto.relatedPostIds);
    await this.validateImages(dto);
    const content = normalizeMarkdownContent(dto.content);
    validateMarkdownDraftContent(content);
    const contentMediaIds = await this.resolveContentMediaIds(content);
    const editable = this.editablePayload({ ...dto, slug, content });
    const post = new this.postModel({
      ...editable,
      contentFormat: 'markdown',
      contentVersion: 1,
      version: 1,
      contentHash: calculateContentHash(editable),
      contentMediaIds,
      author: authorId,
      status: PostStatus.DRAFT,
      statusChangedAt: new Date(),
      statusChangedBy: authorId,
      readTime: calculateMarkdownReadTime(content),
      viewCount: 0,
      uniqueViewCount: 0,
      previousSlugs: [],
    });
    await post.save();
    const revision = await this.revisions.create(post, authorId, 'manual_save');
    await this.syncMedia(post);
    await this.audit.log({
      action: 'post.created',
      resource: 'Post',
      resourceId: post._id.toString(),
      metadata: { version: post.version, revisionId: revision?._id },
      request: req,
    });
    return post;
  }

  async update(id: string, dto: UpdatePostContentDto, req?: RequestLike) {
    const current = await this.postModel.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });
    if (!current) throw new NotFoundException('المقال غير موجود');
    if (current.version !== dto.expectedVersion) {
      this.versionConflict(current.version);
    }

    const userId = this.userId(req);
    const content =
      dto.content === undefined
        ? current.content
        : normalizeMarkdownContent(dto.content);
    validateMarkdownDraftContent(content);
    const rawSlug = dto.slug || dto.title || current.slug;
    const slug = rawSlug ? normalizeSlug(rawSlug) : undefined;
    if (slug && slug !== current.slug) await this.assertSlugAvailable(slug, id);
    await this.validateRelations(
      dto.category,
      dto.tags,
      dto.relatedPostIds,
      id,
    );
    await this.validateImages(dto);

    const merged = this.editablePayload({
      ...this.revisions.snapshot(current),
      ...dto,
      slug,
      content,
    });
    const contentHash = calculateContentHash(merged);
    if (contentHash === current.contentHash) return current;

    const contentMediaIds = await this.resolveContentMediaIds(content);
    const update: Record<string, any> = {
      $set: {
        ...merged,
        contentHash,
        contentMediaIds,
        readTime: calculateMarkdownReadTime(content),
      },
      $inc: { version: 1, contentVersion: dto.content === undefined ? 0 : 1 },
    };
    if (slug && slug !== current.slug && current.slug) {
      update.$addToSet = { previousSlugs: current.slug };
    }

    const post = await this.postModel.findOneAndUpdate(
      { _id: id, version: dto.expectedVersion, deletedAt: { $exists: false } },
      update,
      { new: true },
    );
    if (!post) {
      const server = await this.postModel.findById(id).select('version');
      this.versionConflict(server?.version ?? dto.expectedVersion);
    }
    const saved = post as Post;

    if (slug && slug !== current.slug && current.slug) {
      await this.redirectModel.findOneAndUpdate(
        { oldSlug: current.slug },
        {
          postId: current._id,
          oldSlug: current.slug,
          newSlug: slug,
          createdBy: userId,
        },
        { upsert: true, new: true },
      );
      await this.redirectModel.updateMany(
        { postId: current._id, oldSlug: { $ne: current.slug } },
        { $set: { newSlug: slug } },
      );
      await this.audit.log({
        action: 'post.slug_changed',
        resource: 'Post',
        resourceId: id,
        metadata: { oldSlug: current.slug, newSlug: slug },
        request: req,
      });
    }

    const reason = ((dto as any).saveReason ?? 'manual_save') as
      | 'manual_save'
      | 'autosave'
      | 'restore';
    const revision = await this.revisions.create(saved, userId, reason);
    await this.syncMedia(saved);
    await this.audit.log({
      action: reason === 'autosave' ? 'post.autosaved' : 'post.updated',
      resource: 'Post',
      resourceId: id,
      metadata: {
        previousVersion: current.version,
        version: saved.version,
        revisionId: revision?._id,
        changedFields: Object.keys(dto).filter(
          (key) => !['content', 'expectedVersion'].includes(key),
        ),
        contentChanged: dto.content !== undefined,
      },
      request: req,
    });
    if (saved.status === PostStatus.PUBLISHED) {
      await (saved as any).populate([
        { path: 'category', select: 'slug' },
        { path: 'tags', select: 'slug' },
      ]);
      await this.revalidation.revalidate(
        this.revalidation.tagsForPost(
          saved,
          slug !== current.slug ? current.slug : undefined,
        ),
      );
    } else {
      await this.revalidation.revalidate([
        ...(slug ? [`blog:post:${slug}`] : []),
        ...(current.slug && slug !== current.slug ? [`blog:post:${current.slug}`] : []),
      ]);
    }
    return saved;
  }

  async restoreRevision(
    postId: string,
    revisionId: string,
    dto: RestoreRevisionDto,
    req?: RequestLike,
  ) {
    const revision = await this.revisions.findOne(postId, revisionId);
    const result = await this.update(
      postId,
      {
        ...(revision.snapshot as any),
        expectedVersion: dto.expectedVersion,
        saveReason: 'restore',
      },
      req,
    );
    await this.audit.log({
      action: 'post.revision_restored',
      resource: 'Post',
      resourceId: postId,
      metadata: {
        sourceRevisionId: revisionId,
        restoredVersion: result.version,
      },
      request: req,
    });
    return result;
  }

  async trash(id: string, req?: RequestLike) {
    const post = await this.postModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      {
        $set: { deletedAt: new Date(), deletedBy: this.userId(req) },
        $inc: { version: 1 },
      },
      { new: true },
    );
    if (!post) throw new NotFoundException('المقال غير موجود');
    await this.audit.log({
      action: 'post.trashed',
      resource: 'Post',
      resourceId: id,
      request: req,
    });
    await this.revalidation.revalidate([
      'blog',
      'blog:list',
      'blog:sitemap',
      'blog:rss',
      `blog:post:${post.slug}`,
    ]);
    return post;
  }

  async restore(id: string, req?: RequestLike) {
    const post = await this.postModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: true } },
      { $unset: { deletedAt: 1, deletedBy: 1 }, $inc: { version: 1 } },
      { new: true },
    );
    if (!post) throw new NotFoundException('المقال غير موجود في سلة المحذوفات');
    await this.audit.log({
      action: 'post.restored',
      resource: 'Post',
      resourceId: id,
      request: req,
    });

    await this.revalidation.revalidate([
      'blog',
      'blog:list',
      'blog:sitemap',
      'blog:rss',
      `blog:post:${post.slug}`,
    ]);

    return post;
  }

  async permanentDelete(
    id: string,
    dto: PermanentDeletePostDto,
    req?: RequestLike,
  ) {
    const post = await this.postModel.findOne({
      _id: id,
      deletedAt: { $exists: true },
    });
    if (!post)
      throw new BadRequestException('يجب نقل المقال إلى سلة المحذوفات أولاً');
    if (dto.confirmation !== post.title && dto.confirmation !== 'DELETE') {
      throw new BadRequestException('نص التأكيد غير مطابق');
    }
    await Promise.all([
      this.postModel.deleteOne({ _id: id }),
      this.redirectModel.deleteMany({ postId: id }),
      this.revisionModel.deleteMany({ postId: id }),
      this.viewModel.deleteMany({ postId: id }),
      this.postModel.updateMany(
        { relatedPostIds: id },
        { $pull: { relatedPostIds: id } as any }
      ),
      this.mediaService.removeUsageForEntity('Post', id),
    ]);
    await this.audit.log({
      action: 'post.deleted_permanently',
      resource: 'Post',
      resourceId: id,
      request: req,
    });
  }

  async bulkTaxonomy(
    ids: string[],
    action: 'set-category' | 'add-tag',
    valueId: string,
    req?: RequestLike,
  ) {
    if (action === 'set-category') await this.validateRelations(valueId);
    else await this.validateRelations(undefined, [valueId]);
    const update =
      action === 'set-category'
        ? { $set: { category: valueId }, $inc: { version: 1 } }
        : { $addToSet: { tags: valueId }, $inc: { version: 1 } };
    const result = await this.postModel.updateMany(
      { _id: { $in: ids }, deletedAt: { $exists: false } },
      update,
    );
    await this.audit.log({
      action: `post.bulk_${action}`,
      resource: 'Post',
      metadata: { ids, valueId, modified: result.modifiedCount },
      request: req,
    });

    const affectedPosts = await this.postModel.find({ _id: { $in: ids } }, 'slug').lean();
    const tagsToRevalidate = ['blog', 'blog:list', 'blog:sitemap', 'blog:rss'];
    if (action === 'set-category') {
      const category = await this.categoryModel.findById(valueId, 'slug').lean();
      if (category) tagsToRevalidate.push(`blog:category:${category.slug}`);
    } else {
      const tag = await this.tagModel.findById(valueId, 'slug').lean();
      if (tag) tagsToRevalidate.push(`blog:tag:${tag.slug}`);
    }
    affectedPosts.forEach((p) => tagsToRevalidate.push(`blog:post:${p.slug}`));
    await this.revalidation.revalidate(tagsToRevalidate);

    return { matched: result.matchedCount, modified: result.modifiedCount };
  }

  private editablePayload(input: Record<string, any>) {
    return {
      title: sanitizePlainText(input.title) ?? '',
      slug: input.slug,
      summary: sanitizePlainText(input.summary) ?? '',
      excerpt: sanitizePlainText(input.excerpt),
      content: input.content,
      featuredImageMediaId: input.featuredImageMediaId || undefined,
      coverImageMediaId: input.coverImageMediaId || undefined,
      category: input.category,
      tags: input.tags ?? [],
      relatedPostIds: input.relatedPostIds ?? [],
      isFeatured: Boolean(input.isFeatured),
      featuredOrder: input.isFeatured ? (input.featuredOrder ?? 0) : undefined,
      allowIndexing: input.allowIndexing !== false,
      canonicalUrl: input.canonicalUrl || undefined,
      seo: input.seo ?? {},
    };
  }

  private async validateRelations(
    category?: string,
    tags?: string[],
    related?: string[],
    postId?: string,
  ) {
    if (category) {
      const exists = await this.categoryModel.exists({
        _id: category,
        isActive: true,
        deletedAt: { $exists: false },
      });
      if (!exists)
        throw new BadRequestException('التصنيف غير موجود أو غير نشط');
    }
    if (tags?.length) {
      const unique = [...new Set(tags)];
      const count = await this.tagModel.countDocuments({
        _id: { $in: unique },
        isActive: true,
        deletedAt: { $exists: false },
      });
      if (count !== unique.length)
        throw new BadRequestException('وسم واحد أو أكثر غير موجود أو غير نشط');
    }
    if (related?.length) {
      if (postId && related.includes(postId))
        throw new BadRequestException('لا يمكن ربط المقال بنفسه');
      const count = await this.postModel.countDocuments({
        _id: { $in: [...new Set(related)] },
        deletedAt: { $exists: false },
      });
      if (count !== new Set(related).size)
        throw new BadRequestException('مقال مرتبط واحد أو أكثر غير موجود');
    }
  }

  private async validateImages(dto: Record<string, any>) {
    for (const mediaId of [
      dto.featuredImageMediaId,
      dto.coverImageMediaId,
      dto.seo?.ogImageMediaId,
    ]) {
      if (mediaId)
        await this.mediaService.assertMediaExists(mediaId, { type: 'image' });
    }
  }

  private async resolveContentMediaIds(
    content: string,
  ): Promise<Types.ObjectId[]> {
    const ids = await this.mediaService.findIdsByUrls(
      extractInternalMediaUrls(content),
    );
    return ids.map((id) => new Types.ObjectId(id));
  }

  private async syncMedia(post: Post) {
    const id = post._id.toString();
    await Promise.all([
      this.mediaService.syncUsageByIds(
        post.featuredImageMediaId ? [post.featuredImageMediaId.toString()] : [],
        'Post',
        id,
        'featuredImage',
      ),
      this.mediaService.syncUsageByIds(
        post.coverImageMediaId ? [post.coverImageMediaId.toString()] : [],
        'Post',
        id,
        'coverImage',
      ),
      this.mediaService.syncUsageByIds(
        post.seo?.ogImageMediaId ? [post.seo.ogImageMediaId.toString()] : [],
        'Post',
        id,
        'seo.ogImage',
      ),
      this.mediaService.syncUsageByIds(
        (post.contentMediaIds ?? []).map((item) => item.toString()),
        'Post',
        id,
        'content',
      ),
    ]);
  }

  private async assertSlugAvailable(slug: string, excludeId?: string) {
    const [post, redirect] = await Promise.all([
      this.postModel.exists({
        slug,
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
      }),
      this.redirectModel.exists({
        oldSlug: slug,
        ...(excludeId ? { postId: { $ne: excludeId } } : {}),
      }),
    ]);
    if (post || redirect)
      throw new ConflictException(
        'رابط المقال مستخدم حاليًا أو كان مستخدمًا سابقًا',
      );
  }

  private versionConflict(serverVersion: number): never {
    throw new ConflictException({
      code: 'POST_VERSION_CONFLICT',
      serverVersion,
      message: 'تم تعديل المقال من جلسة أخرى',
    });
  }

  private userId(req?: RequestLike): string {
    const value = req?.user?.userId || req?.user?.id || req?.user?._id;
    if (!value) throw new BadRequestException('تعذر تحديد المستخدم الحالي');
    return value;
  }
}
