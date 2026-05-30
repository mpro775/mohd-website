import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostStatus } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';
import { createPaginatedResponse } from '../../../common/utils/pagination.util';
import { MediaService } from '../../media/media.service';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';

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
  }

  async create(
    createPostDto: CreatePostDto,
    authorId: string,
    req?: any,
  ): Promise<Post> {
    const post = new this.postModel({
      ...createPostDto,
      slug: this.generateSlug(createPostDto.title),
      readTime:
        createPostDto.readTime || this.calculateReadTime(createPostDto.content),
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

    const updateData: any = { ...updatePostDto };
    if (updatePostDto.title) {
      updateData.slug = this.generateSlug(updatePostDto.title);
    }
    if (updatePostDto.content && !updatePostDto.readTime) {
      updateData.readTime = this.calculateReadTime(updatePostDto.content);
    }
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

    const updateData: any = { status };
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

    await this.mediaService.syncUsage(
      [],
      'Post',
      post._id.toString(),
      'featuredImage',
    );
    await this.mediaService.syncUsage(
      [],
      'Post',
      post._id.toString(),
      'coverImage',
    );
    await this.mediaService.syncUsage(
      [],
      'Post',
      post._id.toString(),
      'seo.ogImage',
    );

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
      tag,
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
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 } as Record<
      string,
      1 | -1
    >;

    const [data, total] = await Promise.all([
      this.withPopulates(
        this.postModel.find(query).sort(sort).skip(skip).limit(limit),
      ),
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

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private calculateReadTime(content: string): number {
    return Math.max(
      1,
      Math.ceil(content.split(/\s+/).filter(Boolean).length / 200),
    );
  }
}
