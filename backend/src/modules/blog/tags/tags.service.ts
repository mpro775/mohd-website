import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag } from './schemas/tag.schema';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { FilterTagDto } from './dto/filter-tag.dto';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { normalizeSlug } from '../../../common/utils/slug.util';
import { buildSafeRegex } from '../../../common/utils/regex.util';
import { createPaginatedResponse } from '../../../common/utils/pagination.util';
import { IPaginatedResponse } from '../../../common/dto/pagination.dto';
import { Post, PostStatus } from '../posts/schemas/post.schema';
import { MergeTagsDto } from './dto/merge-tags.dto';
import { PostsRevalidationService } from '../posts/posts-revalidation.service';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly auditLogsService: AuditLogsService,
    private readonly revalidation: PostsRevalidationService,
  ) {}

  private async assertSlugIsAvailable(slug: string, excludeId?: string) {
    const existing = await this.tagModel.exists({
      $or: [{ slug }, { previousSlugs: slug }],
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (existing) {
      throw new ConflictException('Tag slug already exists');
    }
  }

  async create(createTagDto: CreateTagDto, req?: any): Promise<Tag> {
    const slug = normalizeSlug(createTagDto.slug || createTagDto.name);
    await this.assertSlugIsAvailable(slug);

    const tag = new this.tagModel({
      ...createTagDto,
      slug,
    });
    const saved = await tag.save();

    await this.auditLogsService.log({
      action: 'tag.created',
      resource: 'Tag',
      resourceId: saved._id.toString(),
      after: saved.toObject(),
      request: req,
    });

    await this.revalidation.revalidate(['blog', 'blog:list']);

    return saved;
  }

  async findAll(): Promise<Tag[]> {
    return this.findAllPublic();
  }

  async findOne(id: string): Promise<Tag> {
    return this.findOneAdmin(id);
  }

  async findAllPublic(): Promise<any[]> {
    const [tags, counts] = await Promise.all([
      this.tagModel
        .find({ isActive: true, deletedAt: { $exists: false } })
        .sort({ order: 1, name: 1 })
        .lean(),
      this.postModel.aggregate([
        {
          $match: {
            status: PostStatus.PUBLISHED,
            publishedAt: { $lte: new Date() },
            deletedAt: { $exists: false },
          },
        },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', postCount: { $sum: 1 } } },
      ]),
    ]);
    const countMap = new Map(
      counts.map((item) => [item._id?.toString(), item.postCount]),
    );
    return tags.map((item) => ({
      ...item,
      postCount: countMap.get(item._id.toString()) ?? 0,
    }));
  }

  async findAllAdmin(queryDto: FilterTagDto): Promise<IPaginatedResponse<Tag>> {
    const page = Number(queryDto.page ?? 1);
    const limit = Number(queryDto.limit ?? 10);
    const skip = (page - 1) * limit;

    const query: any = {};

    const isActive =
      typeof queryDto.isActive === 'boolean'
        ? queryDto.isActive
        : queryDto.status === 'active'
          ? true
          : queryDto.status === 'inactive'
            ? false
            : undefined;

    if (typeof isActive === 'boolean') query.isActive = isActive;

    const searchRegex = buildSafeRegex(queryDto.search);
    if (searchRegex) {
      query.$or = [
        { name: searchRegex },
        { slug: searchRegex },
        { description: searchRegex },
      ];
    }

    const allowedSortFields = new Set([
      'createdAt',
      'updatedAt',
      'name',
      'order',
    ]);
    const sortBy = allowedSortFields.has(queryDto.sortBy ?? '')
      ? queryDto.sortBy
      : 'createdAt';
    const sortOrder = queryDto.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.tagModel
        .find(query)
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.tagModel.countDocuments(query),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOnePublic(requestedSlug: string): Promise<any> {
    const tag = await this.tagModel
      .findOne({
        $or: [{ slug: requestedSlug }, { previousSlugs: requestedSlug }],
        isActive: true,
        deletedAt: { $exists: false },
      })
      .lean();
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return {
      ...tag,
      canonicalSlug: tag.slug,
      redirectRequired: tag.slug !== requestedSlug,
    };
  }

  async findOneAdmin(id: string): Promise<Tag> {
    const tag = await this.tagModel.findById(id);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async setStatus(id: string, isActive: boolean, req?: any): Promise<Tag> {
    const oldTag = await this.tagModel.findById(id);
    if (!oldTag) {
      throw new NotFoundException('Tag not found');
    }
    const before = oldTag.toObject();

    const tag = await this.tagModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    await this.auditLogsService.log({
      action: isActive ? 'tag.activated' : 'tag.deactivated',
      resource: 'Tag',
      resourceId: tag._id.toString(),
      before,
      after: tag.toObject(),
      request: req,
    });

    await this.revalidation.revalidate([
      'blog',
      'blog:list',
      `blog:tag:${tag.slug}`,
    ]);

    return tag;
  }

  async update(
    id: string,
    updateTagDto: UpdateTagDto,
    req?: any,
  ): Promise<Tag> {
    const oldTag = await this.tagModel.findById(id);
    if (!oldTag) {
      throw new NotFoundException('Tag not found');
    }
    const before = oldTag.toObject();
    const updateData: any = { ...updateTagDto };

    if (updateTagDto.name || updateTagDto.slug) {
      const slug = normalizeSlug(
        updateTagDto.slug || updateTagDto.name || oldTag.slug,
      );
      if (slug !== oldTag.slug) {
        await this.assertSlugIsAvailable(slug, id);
        updateData.slug = slug;
        updateData.previousSlugs = [
          ...new Set([...(oldTag.previousSlugs ?? []), oldTag.slug]),
        ];
      }
    }

    const tag = await this.tagModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    await this.auditLogsService.log({
      action: 'tag.updated',
      resource: 'Tag',
      resourceId: tag._id.toString(),
      before,
      after: tag.toObject(),
      request: req,
    });

    const tags = ['blog', 'blog:list', `blog:tag:${tag.slug}`];
    if (before.slug !== tag.slug) tags.push(`blog:tag:${before.slug}`);
    await this.revalidation.revalidate(tags);

    return tag;
  }

  async remove(id: string, req?: any): Promise<void> {
    const oldTag = await this.tagModel.findById(id);
    if (!oldTag) {
      throw new NotFoundException('Tag not found');
    }
    const before = oldTag.toObject();

    if (await this.postModel.exists({ tags: id })) {
      throw new ConflictException(
        'Tag is used by existing posts; merge or deactivate it',
      );
    }

    await this.tagModel.findByIdAndUpdate(id, {
      isActive: false,
      deletedAt: new Date(),
    });

    await this.auditLogsService.log({
      action: 'tag.deleted',
      resource: 'Tag',
      resourceId: id,
      before,
      request: req,
    });

    await this.revalidation.revalidate([
      'blog',
      'blog:list',
      `blog:tag:${oldTag.slug}`,
    ]);
  }

  async merge(dto: MergeTagsDto, req?: any): Promise<Tag> {
    if (dto.sourceTagId === dto.targetTagId) {
      throw new ConflictException('Source and target tags must be different');
    }
    const [source, target] = await Promise.all([
      this.tagModel.findById(dto.sourceTagId),
      this.tagModel.findOne({
        _id: dto.targetTagId,
        isActive: true,
        deletedAt: { $exists: false },
      }),
    ]);
    if (!source || !target)
      throw new NotFoundException('Source or target tag not found');
    const posts = await this.postModel
      .find({ tags: source._id })
      .select('_id tags');
    for (const post of posts) {
      const tags = [
        ...new Set(
          post.tags
            .map((item) => item.toString())
            .filter((id) => id !== source._id.toString())
            .concat(target._id.toString()),
        ),
      ];
      await this.postModel.updateOne(
        { _id: post._id },
        { $set: { tags }, $inc: { version: 1 } },
      );
    }

    target.previousSlugs = [
      ...new Set([
        ...(target.previousSlugs ?? []),
        source.slug,
        ...(source.previousSlugs ?? []),
      ]),
    ];
    await target.save();

    source.isActive = false;
    source.deletedAt = new Date();
    await source.save();

    await this.auditLogsService.log({
      action: 'tag.merged',
      resource: 'Tag',
      resourceId: source._id.toString(),
      metadata: {
        targetTagId: target._id.toString(),
        migratedPosts: posts.length,
      },
      request: req,
    });

    await this.revalidation.revalidate([
      'blog',
      'blog:list',
      `blog:tag:${source.slug}`,
      `blog:tag:${target.slug}`,
    ]);

    return target;
  }
}
