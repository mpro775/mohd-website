import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private async assertSlugIsAvailable(slug: string, excludeId?: string) {
    const existing = await this.tagModel.findOne({
      slug,
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

    return saved;
  }

  async findAll(): Promise<Tag[]> {
    return this.findAllPublic();
  }

  async findOne(id: string): Promise<Tag> {
    return this.findOneAdmin(id);
  }

  async findAllPublic(): Promise<Tag[]> {
    return this.tagModel.find({ isActive: true }).sort({ name: 1 });
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

  async findOnePublic(slug: string): Promise<Tag> {
    const tag = await this.tagModel.findOne({ slug, isActive: true });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
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

    return tag;
  }

  async remove(id: string, req?: any): Promise<void> {
    const oldTag = await this.tagModel.findById(id);
    if (!oldTag) {
      throw new NotFoundException('Tag not found');
    }
    const before = oldTag.toObject();

    await this.tagModel.findByIdAndDelete(id);

    await this.auditLogsService.log({
      action: 'tag.deleted',
      resource: 'Tag',
      resourceId: id,
      before,
      request: req,
    });
  }
}
