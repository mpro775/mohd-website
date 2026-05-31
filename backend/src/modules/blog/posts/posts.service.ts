import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Post, PostStatus } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';
import { createPaginatedResponse } from '../../../common/utils/pagination.util';
import { MediaService } from '../../media/media.service';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { Category } from '../categories/schemas/category.schema';
import { Tag } from '../tags/schemas/tag.schema';
import { generateSlug } from '../../../common/utils/slug.util';
import {
  sanitizePlainText,
  sanitizePostContent,
} from '../../../common/utils/sanitize-content.util';

const ALLOWED_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'publishDate',
  'title',
  'views',
  'readTime',
];

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
    private readonly mediaService: MediaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private async syncMedia(post: Post) {
    const featuredImages = post.featuredImage ? [post.featuredImage] : [];
    await this.mediaService.syncUsage(
      featuredImages,
      'Post',
      post._id.toString(),
      'featuredImage',
    );
    const coverImages = post.coverImage ? [post.coverImage] : [];
    await this.mediaService.syncUsage(
      coverImages,
      'Post',
      post._id.toString(),
      'coverImage',
    );
    const ogImages = post.seo?.ogImage ? [post.seo.ogImage] : [];
    await this.mediaService.syncUsage(
      ogImages,
      'Post',
      post._id.toString(),
      'seo.ogImage',
    );
    await this.mediaService.syncUsage(
      this.mediaService.extractMediaUrlsFromContent(post.content || ''),
      'Post',
      post._id.toString(),
      'content',
    );
  }

  async create(
    createPostDto: CreatePostDto,
    authorId: string,
    req?: any,
  ): Promise<Post> {
    const slug = this.normalizeSlug(createPostDto.title);
    await this.assertSlugIsAvailable(slug);
    await this.validateRelations(createPostDto.category, createPostDto.tags);
    const sanitizedContent = sanitizePostContent(createPostDto.content);
    const post = new this.postModel({
      ...createPostDto,
      slug,
      content: sanitizedContent,
      excerpt: sanitizePlainText(createPostDto.excerpt),
      readTime: this.calculateReadTime(sanitizedContent),
      author: authorId,
    });
    if (post.status === PostStatus.PUBLISHED && !post.publishDate) {
      post.publishDate = new Date();
      post.lastPublishedAt = new Date();
    } else if (post.status === PostStatus.SCHEDULED && post.publishDate) {
      post.scheduledAt = post.publishDate;
    }
    const saved = await post.save();
    await this.syncMedia(saved);

    // Audit Log
    await this.auditLogsService.log({
      action: 'post.created',
      resource: 'Post',
      resourceId: saved._id.toString(),
      after: saved.toObject(),
      request: req,
    });

    return this.findOneAdmin(saved._id.toString());
  }

  async findAllPublic(filterDto: FilterPostDto) {
    return this.findAll(filterDto, true);
  }

  async findAllAdmin(filterDto: FilterPostDto) {
    return this.findAll(filterDto, false);
  }

  async findOneAdmin(id: string): Promise<Post> {
    const post = await this.withPopulates(this.postModel.findById(id));
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async findBySlugPublic(slug: string): Promise<Post> {
    const post = await this.withPopulates(
      this.postModel.findOneAndUpdate(
        {
          slug,
          status: PostStatus.PUBLISHED,
          publishDate: { $lte: new Date() },
        },
        { $inc: { views: 1 } },
        { new: true },
      ),
    );

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    req?: any,
  ): Promise<Post> {
    const oldPost = await this.postModel.findById(id);
    if (!oldPost) {
      throw new NotFoundException('Post not found');
    }
    const before = oldPost.toObject();

    const updateData: Partial<UpdatePostDto> & {
      slug?: string;
      updatedDate?: Date;
      readTime?: number;
      content?: string;
      excerpt?: string;
    } = { ...updatePostDto };
    delete updateData.content;
    if (updatePostDto.title) {
      const slug = this.normalizeSlug(updatePostDto.title);
      if (slug !== oldPost.slug) {
        await this.assertSlugIsAvailable(slug, id);
        updateData.slug = slug;
      }
    }
    if (updatePostDto.content !== undefined) {
      updateData.content = sanitizePostContent(updatePostDto.content);
      updateData.readTime = this.calculateReadTime(updateData.content);
    }
    if (updatePostDto.excerpt !== undefined) {
      updateData.excerpt = sanitizePlainText(updatePostDto.excerpt);
    }
    await this.validateRelations(updatePostDto.category, updatePostDto.tags);
    updateData.updatedDate = new Date();

    const post = await this.postModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.syncMedia(post);

    // Audit Log
    await this.auditLogsService.log({
      action: 'post.updated',
      resource: 'Post',
      resourceId: post._id.toString(),
      before,
      after: post.toObject(),
      request: req,
    });

    return this.findOneAdmin(post._id.toString());
  }

  async setStatus(id: string, status: PostStatus, req?: any): Promise<Post> {
    const oldPost = await this.postModel.findById(id);
    if (!oldPost) {
      throw new NotFoundException('Post not found');
    }
    const before = oldPost.toObject();

    const updateData: {
      status: PostStatus;
      publishDate?: Date;
      lastPublishedAt?: Date;
    } = { status };
    if (status === PostStatus.PUBLISHED) {
      updateData.publishDate = new Date();
      updateData.lastPublishedAt = new Date();
    }
    const post = await this.postModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Audit Log
    await this.auditLogsService.log({
      action:
        status === PostStatus.PUBLISHED ? 'post.published' : 'post.unpublished',
      resource: 'Post',
      resourceId: post._id.toString(),
      before,
      after: post.toObject(),
      request: req,
    });

    return this.findOneAdmin(post._id.toString());
  }

  async schedule(id: string, publishDate: Date, req?: any): Promise<Post> {
    if (Number.isNaN(publishDate.getTime())) {
      throw new BadRequestException('Invalid publishDate');
    }
    const oldPost = await this.postModel.findById(id);
    if (!oldPost) {
      throw new NotFoundException('Post not found');
    }
    const before = oldPost.toObject();

    const post = await this.postModel.findByIdAndUpdate(
      id,
      {
        status: PostStatus.SCHEDULED,
        publishDate,
        scheduledAt: publishDate,
      },
      { new: true },
    );
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Audit Log
    await this.auditLogsService.log({
      action: 'post.scheduled',
      resource: 'Post',
      resourceId: post._id.toString(),
      before,
      after: post.toObject(),
      request: req,
    });

    return this.findOneAdmin(post._id.toString());
  }

  async publishDueScheduledPosts(now = new Date()): Promise<{
    matched: number;
    modified: number;
  }> {
    const duePosts = await this.postModel
      .find({
        status: PostStatus.SCHEDULED,
        $or: [{ publishDate: { $lte: now } }, { scheduledAt: { $lte: now } }],
      })
      .select('_id publishDate scheduledAt')
      .exec();

    if (!duePosts.length) {
      return { matched: 0, modified: 0 };
    }

    let modified = 0;
    for (const post of duePosts) {
      const publishDate = post.publishDate || post.scheduledAt || now;
      const result = await this.postModel.updateOne(
        { _id: post._id, status: PostStatus.SCHEDULED },
        {
          status: PostStatus.PUBLISHED,
          publishDate,
          lastPublishedAt: now,
        },
      );
      modified += result.modifiedCount;
    }

    await this.auditLogsService.log({
      action: 'post.auto_published',
      resource: 'Post',
      metadata: { matched: duePosts.length, modified },
    });

    return { matched: duePosts.length, modified };
  }

  async archive(id: string, req?: any): Promise<Post> {
    const oldPost = await this.postModel.findById(id);
    if (!oldPost) {
      throw new NotFoundException('Post not found');
    }
    const before = oldPost.toObject();

    const post = await this.postModel.findByIdAndUpdate(
      id,
      { status: PostStatus.ARCHIVED },
      { new: true },
    );
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Audit Log
    await this.auditLogsService.log({
      action: 'post.archived',
      resource: 'Post',
      resourceId: post._id.toString(),
      before,
      after: post.toObject(),
      request: req,
    });

    return this.findOneAdmin(post._id.toString());
  }

  async remove(id: string, req?: any): Promise<void> {
    const oldPost = await this.postModel.findById(id);
    if (!oldPost) {
      throw new NotFoundException('Post not found');
    }
    const before = oldPost.toObject();

    const post = await this.postModel.findByIdAndDelete(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.mediaService.removeUsageForEntity('Post', post._id.toString());

    // Audit Log
    await this.auditLogsService.log({
      action: 'post.deleted',
      resource: 'Post',
      resourceId: id,
      before,
      request: req,
    });
  }

  private async findAll(filterDto: FilterPostDto, publicOnly: boolean) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'publishDate',
      sortOrder = 'desc',
      category,
      categorySlug,
      tag,
      tagSlug,
      status,
    } = filterDto;

    if (sortBy && !ALLOWED_SORT_FIELDS.includes(sortBy)) {
      throw new BadRequestException(`Sorting by ${sortBy} is not allowed`);
    }

    const query: Record<string, unknown> = {};
    if (publicOnly) {
      query.status = PostStatus.PUBLISHED;
      query.publishDate = { $lte: new Date() };
    } else if (status) {
      query.status = status;
    }
    if (publicOnly) {
      const categoryFilter = categorySlug || category;
      const tagFilter = tagSlug || tag;
      if (categoryFilter) {
        const categoryDoc = await this.categoryModel.findOne({
          slug: generateSlug(categoryFilter),
          isActive: true,
        });
        if (!categoryDoc) {
          return createPaginatedResponse([], 0, page, limit);
        }
        query.category = categoryDoc._id;
      }
      if (tagFilter) {
        const tagDoc = await this.tagModel.findOne({
          slug: generateSlug(tagFilter),
          isActive: true,
        });
        if (!tagDoc) {
          return createPaginatedResponse([], 0, page, limit);
        }
        query.tags = tagDoc._id;
      }
    } else {
      if (category) {
        if (!isValidObjectId(category)) {
          throw new BadRequestException('category must be a valid MongoId');
        }
        query.category = category;
      }
      if (tag) {
        if (!isValidObjectId(tag)) {
          throw new BadRequestException('tag must be a valid MongoId');
        }
        query.tags = tag;
      }
    }
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 } as Record<
      string,
      1 | -1
    >;

    const [data, total] = await Promise.all([
      this.postModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .populate('author', 'name email')
        .exec(),
      this.postModel.countDocuments(query),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  private withPopulates(query: any) {
    if (!query) return null;
    return query
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .populate('author', 'name email')
      .exec();
  }

  private normalizeSlug(value: string): string {
    const slug = generateSlug(value);
    if (!slug) {
      throw new BadRequestException('Slug cannot be empty');
    }
    return slug;
  }

  private async assertSlugIsAvailable(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.postModel.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (existing) {
      throw new ConflictException('Post slug already exists');
    }
  }

  private async validateRelations(category?: string, tags?: string[]) {
    if (category) {
      const exists = await this.categoryModel.exists({ _id: category });
      if (!exists) {
        throw new BadRequestException('Category does not exist');
      }
    }

    if (tags?.length) {
      const uniqueTags = [...new Set(tags)];
      const count = await this.tagModel.countDocuments({
        _id: { $in: uniqueTags },
      });
      if (count !== uniqueTags.length) {
        throw new BadRequestException('One or more tags do not exist');
      }
    }
  }

  private calculateReadTime(content: string): number {
    return Math.max(
      1,
      Math.ceil(content.split(/\s+/).filter(Boolean).length / 200),
    );
  }
}
