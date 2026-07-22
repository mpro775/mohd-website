import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FilterCategoryDto } from './dto/filter-category.dto';
import { Post, PostStatus } from '../posts/schemas/post.schema';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { normalizeSlug } from '../../../common/utils/slug.util';
import { buildSafeRegex } from '../../../common/utils/regex.util';
import { createPaginatedResponse } from '../../../common/utils/pagination.util';
import { IPaginatedResponse } from '../../../common/dto/pagination.dto';
import { PostsRevalidationService } from '../posts/posts-revalidation.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly auditLogsService: AuditLogsService,
    private readonly revalidation: PostsRevalidationService,
  ) {}

  private async assertSlugIsAvailable(slug: string, excludeId?: string) {
    const existing = await this.categoryModel.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (existing) {
      throw new ConflictException('Category slug already exists');
    }
  }

  async create(
    createCategoryDto: CreateCategoryDto,
    req?: any,
  ): Promise<Category> {
    const slug = normalizeSlug(
      createCategoryDto.slug || createCategoryDto.name,
    );
    await this.assertSlugIsAvailable(slug);

    const category = new this.categoryModel({
      ...createCategoryDto,
      slug,
    });
    const saved = await category.save();

    await this.auditLogsService.log({
      action: 'category.created',
      resource: 'Category',
      resourceId: saved._id.toString(),
      after: saved.toObject(),
      request: req,
    });

    await this.revalidation.revalidate(['blog', 'blog:list']);

    return saved;
  }

  async findAll(): Promise<Category[]> {
    return this.findAllPublic();
  }

  async findOne(id: string): Promise<Category> {
    return this.findOneAdmin(id);
  }

  async findAllPublic(): Promise<any[]> {
    const [categories, counts] = await Promise.all([
      this.categoryModel
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
        { $group: { _id: '$category', postCount: { $sum: 1 } } },
      ]),
    ]);
    const countMap = new Map(
      counts.map((item) => [item._id?.toString(), item.postCount]),
    );
    return categories.map((item) => ({
      ...item,
      postCount: countMap.get(item._id.toString()) ?? 0,
    }));
  }

  async findAllAdmin(
    queryDto: FilterCategoryDto,
  ): Promise<IPaginatedResponse<Category>> {
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
      this.categoryModel
        .find(query)
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.categoryModel.countDocuments(query),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOnePublic(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({
      slug,
      isActive: true,
      deletedAt: { $exists: false },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findOneAdmin(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async setStatus(id: string, isActive: boolean, req?: any): Promise<Category> {
    const oldCategory = await this.categoryModel.findById(id);
    if (!oldCategory) {
      throw new NotFoundException('Category not found');
    }
    const before = oldCategory.toObject();

    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.auditLogsService.log({
      action: isActive ? 'category.activated' : 'category.deactivated',
      resource: 'Category',
      resourceId: category._id.toString(),
      before,
      after: category.toObject(),
      request: req,
    });

    await this.revalidation.revalidate(['blog', 'blog:list', `blog:category:${category.slug}`]);

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    req?: any,
  ): Promise<Category> {
    const oldCategory = await this.categoryModel.findById(id);
    if (!oldCategory) {
      throw new NotFoundException('Category not found');
    }
    const before = oldCategory.toObject();
    const updateData: any = { ...updateCategoryDto };

    if (updateCategoryDto.name || updateCategoryDto.slug) {
      const slug = normalizeSlug(
        updateCategoryDto.slug || updateCategoryDto.name || oldCategory.slug,
      );
      if (slug !== oldCategory.slug) {
        await this.assertSlugIsAvailable(slug, id);
        updateData.slug = slug;
        updateData.previousSlugs = [
          ...new Set([...(oldCategory.previousSlugs ?? []), oldCategory.slug]),
        ];
      }
    }

    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.auditLogsService.log({
      action: 'category.updated',
      resource: 'Category',
      resourceId: category._id.toString(),
      before,
      after: category.toObject(),
      request: req,
    });

    const tags = ['blog', 'blog:list', `blog:category:${category.slug}`];
    if (before.slug !== category.slug) tags.push(`blog:category:${before.slug}`);
    await this.revalidation.revalidate(tags);

    return category;
  }

  async remove(id: string, req?: any): Promise<void> {
    const postReferencing = await this.postModel.findOne({
      category: id as any,
    });
    if (postReferencing) {
      throw new ConflictException('Category is used by existing posts');
    }

    const oldCategory = await this.categoryModel.findById(id);
    if (!oldCategory) {
      throw new NotFoundException('Category not found');
    }
    const before = oldCategory.toObject();

    await this.categoryModel.findByIdAndUpdate(id, {
      isActive: false,
      deletedAt: new Date(),
    });

    await this.auditLogsService.log({
      action: 'category.deleted',
      resource: 'Category',
      resourceId: id,
      before,
      request: req,
    });

    await this.revalidation.revalidate(['blog', 'blog:list', `blog:category:${oldCategory.slug}`]);
  }
}
