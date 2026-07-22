import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { createPaginatedResponse } from '../../../common/utils/pagination.util';
import { buildSafeRegex } from '../../../common/utils/regex.util';
import { normalizeSlug } from '../../../common/utils/slug.util';
import { MediaService } from '../../media/media.service';
import { Category } from '../categories/schemas/category.schema';
import { Tag } from '../tags/schemas/tag.schema';
import { FilterPostDto } from './dto/filter-post.dto';
import { PostOptionsDto } from './dto/post-options.dto';
import { TaxonomyOptionsDto } from './dto/taxonomy-options.dto';
import {
  mapPostToAdminDetail,
  mapPostToAdminListItem,
  mapPostToPublicDetail,
  mapPostToPublicListItem,
} from './mappers/post.mapper';
import { PostSlugRedirect } from './redirects/schemas/post-slug-redirect.schema';
import { Post, PostStatus } from './schemas/post.schema';

const PUBLIC_FILTER = () => ({
  status: PostStatus.PUBLISHED,
  publishedAt: { $lte: new Date() },
  deletedAt: { $exists: false },
});

@Injectable()
export class PostsQueryService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Tag.name) private readonly tagModel: Model<Tag>,
    @InjectModel(PostSlugRedirect.name)
    private readonly redirectModel: Model<PostSlugRedirect>,
    private readonly mediaService: MediaService,
  ) {}

  async findAllPublic(filter: FilterPostDto) {
    const page = Number(filter.page ?? 1);
    const limit = Math.min(Number(filter.limit ?? 10), 100);
    const query: Record<string, any> = PUBLIC_FILTER();

    if (filter.categorySlug || filter.category) {
      const category = await this.categoryModel.findOne({
        slug: normalizeSlug(filter.categorySlug || filter.category || ''),
        isActive: true,
        deletedAt: { $exists: false },
      });
      if (!category) return createPaginatedResponse([], 0, page, limit);
      query.category = category._id;
    }
    if (filter.tagSlug || filter.tag) {
      const tag = await this.tagModel.findOne({
        slug: normalizeSlug(filter.tagSlug || filter.tag || ''),
        isActive: true,
        deletedAt: { $exists: false },
      });
      if (!tag) return createPaginatedResponse([], 0, page, limit);
      query.tags = tag._id;
    }
    if (filter.featured !== undefined) query.isFeatured = filter.featured;
    if (filter.search?.trim()) {
      if (filter.search.trim().length < 2) {
        throw new BadRequestException(
          'عبارة البحث يجب أن تكون حرفين على الأقل',
        );
      }
      query.$text = { $search: filter.search.trim() };
    }

    const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;
    const [posts, total] = await Promise.all([
      this.postModel
        .find(query)
        .select('-content -contentHash -contentMediaIds -previousSlugs')
        .sort({
          ...(filter.featured === undefined
            ? {}
            : { featuredOrder: 1 as const }),
          publishedAt: sortOrder,
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category', 'name slug')
        .populate('tags', 'name slug color')
        .lean(),
      this.postModel.countDocuments(query),
    ]);
    const mediaMap = await this.mediaMap(posts);
    return createPaginatedResponse(
      posts.map((post) => mapPostToPublicListItem(post, mediaMap)),
      total,
      page,
      limit,
    );
  }

  async findAllAdmin(filter: FilterPostDto) {
    const page = Number(filter.page ?? 1);
    const limit = Math.min(Number(filter.limit ?? 20), 100);
    const query: Record<string, any> = {};
    query.deletedAt = filter.trash ? { $exists: true } : { $exists: false };
    if (filter.status) query.status = filter.status;
    if (filter.featured !== undefined) query.isFeatured = filter.featured;
    if (filter.hasWarnings) {
      query.$or = [
        { 'seo.metaTitle': { $in: [null, ''] } },
        { 'seo.metaDescription': { $in: [null, ''] } },
        { tags: { $size: 0 } },
        { featuredImageMediaId: { $exists: false } },
      ];
    }
    if (filter.author) {
      if (!isValidObjectId(filter.author))
        throw new BadRequestException('author غير صالح');
      query.author = filter.author;
    }
    if (filter.category) {
      if (!isValidObjectId(filter.category))
        throw new BadRequestException('category غير صالح');
      query.category = filter.category;
    }
    if (filter.tag) {
      if (!isValidObjectId(filter.tag))
        throw new BadRequestException('tag غير صالح');
      query.tags = filter.tag;
    }
    if (filter.search?.trim()) {
      query.$text = { $search: filter.search.trim() };
    }
    if (filter.dateFrom || filter.dateTo) {
      query.updatedAt = {};
      if (filter.dateFrom) query.updatedAt.$gte = new Date(filter.dateFrom);
      if (filter.dateTo) query.updatedAt.$lte = new Date(filter.dateTo);
    }

    const allowedSort = new Set([
      'createdAt',
      'updatedAt',
      'publishedAt',
      'scheduledAt',
      'title',
      'viewCount',
      'readTime',
    ]);
    const sortBy = allowedSort.has(filter.sortBy ?? '')
      ? (filter.sortBy as string)
      : 'updatedAt';
    const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;
    const [posts, total] = await Promise.all([
      this.postModel
        .find(query)
        .select('-content -contentHash -contentMediaIds -previousSlugs')
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category', 'name slug')
        .populate('tags', 'name slug color')
        .populate('author', 'name email')
        .lean(),
      this.postModel.countDocuments(query),
    ]);
    const mediaMap = await this.mediaMap(posts);
    return createPaginatedResponse(
      posts.map((post) => mapPostToAdminListItem(post, mediaMap)),
      total,
      page,
      limit,
    );
  }

  async findOneAdmin(id: string) {
    const post = await this.postModel
      .findById(id)
      .populate('category', 'name slug isActive')
      .populate('tags', 'name slug color isActive')
      .populate('author reviewer publisher', 'name email')
      .lean();
    if (!post) throw new NotFoundException('المقال غير موجود');
    const mediaMap = await this.mediaMap([post], true);
    return mapPostToAdminDetail(post, mediaMap);
  }

  async findBySlugPublic(slug: string) {
    const normalized = normalizeSlug(slug);
    let post = await this.publicDetailQuery({ slug: normalized });
    let redirectRequired = false;
    if (!post) {
      const redirect = await this.redirectModel.findOne({
        oldSlug: normalized,
      });
      if (redirect) {
        post = await this.publicDetailQuery({ _id: redirect.postId });
        redirectRequired = Boolean(post);
      }
    }
    if (!post) throw new NotFoundException('المقال غير موجود');
    const mediaMap = await this.mediaMap([post], true);
    return {
      ...mapPostToPublicDetail(post, mediaMap),
      canonicalSlug: post.slug,
      redirectRequired,
    };
  }

  async taxonomyOptions(dto: TaxonomyOptionsDto) {
    const model: Model<any> =
      dto.type === 'tag' ? this.tagModel : this.categoryModel;
    const query: Record<string, any> = {
      isActive: true,
      deletedAt: { $exists: false },
    };
    const regex = buildSafeRegex(dto.search);
    if (regex) query.$or = [{ name: regex }, { slug: regex }];
    const [items, total] = await Promise.all([
      model
        .find(query)
        .select('name slug color')
        .sort({ order: 1, name: 1 })
        .skip((dto.page - 1) * dto.limit)
        .limit(dto.limit)
        .lean(),
      model.countDocuments(query),
    ]);
    return createPaginatedResponse(
      items.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        slug: item.slug,
        color: item.color,
      })),
      total,
      dto.page,
      dto.limit,
    );
  }

  async postOptions(dto: PostOptionsDto) {
    const page = Number(dto.page ?? 1);
    const limit = Math.min(Number(dto.limit ?? 10), 100);
    const query: Record<string, any> = { deletedAt: { $exists: false } };

    if (dto.ids && dto.ids.length > 0) {
      query._id = { $in: dto.ids };
    } else {
      if (dto.status) query.status = dto.status;
      if (dto.excludeId) query._id = { $ne: dto.excludeId };
      if (dto.search?.trim()) {
        const regex = buildSafeRegex(dto.search.trim());
        if (regex) query.$or = [{ title: regex }, { slug: regex }];
      }
    }

    const [posts, total] = await Promise.all([
      this.postModel
        .find(query)
        .select('title slug status featuredImageMediaId publishedAt')
        .sort({ publishedAt: -1, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.postModel.countDocuments(query),
    ]);

    const mediaMap = await this.mediaMap(posts);

    return createPaginatedResponse(
      posts.map((item) => {
        const media = item.featuredImageMediaId
          ? mediaMap.get(item.featuredImageMediaId.toString())
          : null;
        return {
          id: item._id.toString(),
          title: item.title,
          slug: item.slug,
          status: item.status,
          featuredImage: media?.url ?? null,
          publishedAt: item.publishedAt
            ? new Date(item.publishedAt).toISOString()
            : null,
        };
      }),
      total,
      page,
      limit,
    );
  }

  async overview() {
    const now = new Date();
    const [counts, upcoming, recent, top, categories, tags] = await Promise.all(
      [
        this.postModel.aggregate([
          { $match: { deletedAt: { $exists: false } } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        this.postModel
          .find({
            status: PostStatus.SCHEDULED,
            scheduledAt: { $gt: now },
            deletedAt: { $exists: false },
          })
          .select('title slug scheduledAt')
          .sort({ scheduledAt: 1 })
          .limit(5)
          .lean(),
        this.postModel
          .find({ deletedAt: { $exists: false } })
          .select('title slug status updatedAt')
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean(),
        this.postModel
          .find(PUBLIC_FILTER())
          .select('title slug viewCount')
          .sort({ viewCount: -1 })
          .limit(5)
          .lean(),
        this.categoryModel.countDocuments({
          isActive: true,
          deletedAt: { $exists: false },
        }),
        this.tagModel.countDocuments({
          isActive: true,
          deletedAt: { $exists: false },
        }),
      ],
    );
    return {
      counts: Object.fromEntries(counts.map((item) => [item._id, item.count])),
      upcoming,
      recent,
      top,
      incompleteDrafts: await this.postModel.countDocuments({
        status: PostStatus.DRAFT,
        deletedAt: { $exists: false },
        $or: [
          { featuredImageMediaId: { $exists: false } },
          { summary: { $exists: false } },
        ],
      }),
      activeCategories: categories,
      activeTags: tags,
    };
  }

  private publicDetailQuery(match: Record<string, unknown>) {
    return this.postModel
      .findOne({ ...match, ...PUBLIC_FILTER() })
      .populate('category', 'name slug')
      .populate('tags', 'name slug color')
      .populate('author', 'name title avatar')
      .lean();
  }

  private async mediaMap(posts: any[], includeContent = false) {
    const ids = posts.flatMap((post) => [
      post.featuredImageMediaId,
      ...(includeContent
        ? [
            post.coverImageMediaId,
            post.seo?.ogImageMediaId,
            ...(post.contentMediaIds ?? []),
          ]
        : []),
    ]);
    return this.mediaService.resolveMediaObjectsByIds(ids);
  }
}
