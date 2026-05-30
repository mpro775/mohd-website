import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Post } from '../posts/schemas/post.schema';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async create(
    createCategoryDto: CreateCategoryDto,
    req?: any,
  ): Promise<Category> {
    const slug = this.generateSlug(createCategoryDto.name);

    const existingCategory = await this.categoryModel.findOne({ slug });
    if (existingCategory) {
      throw new ConflictException('التصنيف موجود بالفعل');
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      slug,
    });

    const saved = await category.save();

    // Audit Log
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
      throw new NotFoundException('التصنيف غير موجود');
    }
    return category;
  }

  async findOneAdmin(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }
    return category;
  }

  async setStatus(id: string, isActive: boolean, req?: any): Promise<Category> {
    const oldCategory = await this.categoryModel.findById(id);
    if (!oldCategory) {
      throw new NotFoundException('التصنيف غير موجود');
    }
    const before = oldCategory.toObject();

    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );
    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }

    // Audit Log
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
      throw new NotFoundException('التصنيف غير موجود');
    }
    const before = oldCategory.toObject();

    const updateData: any = { ...updateCategoryDto };

    if (updateCategoryDto.name) {
      updateData.slug = this.generateSlug(updateCategoryDto.name);
    }

    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );
    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }

    // Audit Log
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
      throw new ConflictException(
        'لا يمكن حذف التصنيف لأنه مرتبط ببعض المقالات',
      );
    }

    const oldCategory = await this.categoryModel.findById(id);
    if (!oldCategory) {
      throw new NotFoundException('التصنيف غير موجود');
    }
    const before = oldCategory.toObject();

    await this.categoryModel.findByIdAndDelete(id);

    // Audit Log
    await this.auditLogsService.log({
      action: 'category.deleted',
      resource: 'Category',
      resourceId: id,
      before,
      request: req,
    });
  }
}
