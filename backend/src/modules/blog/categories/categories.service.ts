import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Post } from '../posts/schemas/post.schema';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { generateSlug } from '../../../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private normalizeSlug(name: string): string {
    const slug = generateSlug(name);
    if (!slug) {
      throw new BadRequestException('Slug cannot be empty');
    }
    return slug;
  }

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
    const slug = this.normalizeSlug(createCategoryDto.name);
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

    return saved;
  }

  async findAll(): Promise<Category[]> {
    return this.findAllPublic();
  }

  async findOne(id: string): Promise<Category> {
    return this.findOneAdmin(id);
  }

  async findAllPublic(): Promise<Category[]> {
    return this.categoryModel.find({ isActive: true }).sort({ name: 1 });
  }

  async findAllAdmin(): Promise<Category[]> {
    return this.categoryModel.find().sort({ name: 1 });
  }

  async findOnePublic(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ slug, isActive: true });
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

    if (updateCategoryDto.name) {
      const slug = this.normalizeSlug(updateCategoryDto.name);
      if (slug !== oldCategory.slug) {
        await this.assertSlugIsAvailable(slug, id);
        updateData.slug = slug;
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

    await this.categoryModel.findByIdAndDelete(id);

    await this.auditLogsService.log({
      action: 'category.deleted',
      resource: 'Category',
      resourceId: id,
      before,
      request: req,
    });
  }
}
