import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Technology } from './schemas/technology.schema';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { FilterTechnologyDto } from './dto/filter-technology.dto';
import { MediaService } from '../media/media.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { normalizeSlug } from '../../common/utils/slug.util';
import { buildSafeRegex } from '../../common/utils/regex.util';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { IPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class TechnologiesService {
  constructor(
    @InjectModel(Technology.name) private technologyModel: Model<Technology>,
    private readonly mediaService: MediaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private async assertSlugIsAvailable(slug: string, excludeId?: string) {
    const existing = await this.technologyModel.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (existing) {
      throw new ConflictException('Technology slug already exists');
    }
  }

  private async syncMedia(technology: Technology) {
    const icons = technology.iconMediaId ? [technology.iconMediaId.toString()] : [];
    await this.mediaService.syncUsageByIds(
      icons,
      'Technology',
      technology._id.toString(),
      'icon',
    );
  }

  async assertSlugsExist(slugs: string[]): Promise<Technology[]> {
    if (!slugs || slugs.length === 0) {
      return [];
    }
    const cleanSlugs = [...new Set(slugs.map(s => s.toLowerCase().trim()))];
    const found = await this.technologyModel.find({ slug: { $in: cleanSlugs } });
    if (found.length !== cleanSlugs.length) {
      const foundSlugs = found.map(t => t.slug);
      const missingSlugs = cleanSlugs.filter(s => !foundSlugs.includes(s));
      throw new BadRequestException(`التقنيات التالية غير موجودة: ${missingSlugs.join(', ')}`);
    }
    return found;
  }

  async findSummariesBySlugs(slugs: string[]): Promise<any[]> {
    if (!slugs || slugs.length === 0) {
      return [];
    }
    const found = await this.technologyModel.find({ slug: { $in: slugs } });
    return Promise.all(
      found.map(async (tech) => {
        const icon = await this.mediaService.resolveMediaUrl(tech.iconMediaId);
        return {
          name: tech.name,
          slug: tech.slug,
          icon,
          iconMediaId: tech.iconMediaId?.toString(),
          category: tech.category,
          group: tech.group,
          color: tech.color,
        };
      })
    );
  }

  async create(
    createTechnologyDto: CreateTechnologyDto,
    req?: any,
  ): Promise<Technology> {
    const slug = normalizeSlug(
      createTechnologyDto.slug || createTechnologyDto.name,
    );
    await this.assertSlugIsAvailable(slug);

    if (createTechnologyDto.iconMediaId) {
      await this.mediaService.assertMediaExists(createTechnologyDto.iconMediaId, { type: 'image' });
    }

    const technology = new this.technologyModel({
      ...createTechnologyDto,
      slug,
    });
    const saved = await technology.save();
    await this.syncMedia(saved);

    // Audit Log
    await this.auditLogsService.log({
      action: 'technology.created',
      resource: 'Technology',
      resourceId: saved._id.toString(),
      after: saved.toObject(),
      request: req,
    });

    return saved;
  }

  async findAll(category?: string): Promise<Technology[]> {
    const query: any = { isPublished: true };
    if (category) query.category = category;
    return this.technologyModel.find(query).sort({ order: 1, name: 1 });
  }

  async findAllAdmin(
    queryDto: FilterTechnologyDto,
  ): Promise<IPaginatedResponse<Technology>> {
    const page = Number(queryDto.page ?? 1);
    const limit = Number(queryDto.limit ?? 10);
    const skip = (page - 1) * limit;

    const query: any = {};

    if (queryDto.category) {
      query.category = queryDto.category;
    }

    if (typeof queryDto.isPublished === 'boolean') {
      query.isPublished = queryDto.isPublished;
    }

    const searchRegex = buildSafeRegex(queryDto.search);
    if (searchRegex) {
      query.$or = [
        { name: searchRegex },
        { slug: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    const allowedSortFields = new Set([
      'createdAt',
      'updatedAt',
      'order',
      'name',
      'category',
    ]);
    const sortBy = allowedSortFields.has(queryDto.sortBy ?? '')
      ? queryDto.sortBy
      : 'createdAt';
    const sortOrder = queryDto.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.technologyModel
        .find(query)
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.technologyModel.countDocuments(query),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(slug: string): Promise<Technology> {
    const technology = await this.technologyModel.findOne({
      slug,
      isPublished: true,
    });
    if (!technology) throw new NotFoundException('Technology not found');
    return technology;
  }

  async findOneAdmin(id: string): Promise<Technology> {
    const technology = await this.technologyModel.findById(id);
    if (!technology) throw new NotFoundException('Technology not found');
    return technology;
  }

  async update(
    id: string,
    updateTechnologyDto: UpdateTechnologyDto,
    req?: any,
  ): Promise<Technology> {
    const oldTech = await this.technologyModel.findById(id);
    if (!oldTech) throw new NotFoundException('Technology not found');
    const before = oldTech.toObject();

    if (updateTechnologyDto.iconMediaId) {
      await this.mediaService.assertMediaExists(updateTechnologyDto.iconMediaId, { type: 'image' });
    }

    const updateData = {
      ...updateTechnologyDto,
    };
    if (updateTechnologyDto.name || updateTechnologyDto.slug) {
      const slug = normalizeSlug(
        updateTechnologyDto.slug || updateTechnologyDto.name || oldTech.slug,
      );
      if (slug !== oldTech.slug) {
        await this.assertSlugIsAvailable(slug, id);
        updateData.slug = slug;
      }
    }
    const technology = await this.technologyModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );
    if (!technology) throw new NotFoundException('Technology not found');
    await this.syncMedia(technology);

    // Audit Log
    await this.auditLogsService.log({
      action: 'technology.updated',
      resource: 'Technology',
      resourceId: technology._id.toString(),
      before,
      after: technology.toObject(),
      request: req,
    });

    return technology;
  }

  async publish(
    id: string,
    isPublished: boolean,
    req?: any,
  ): Promise<Technology> {
    const oldTech = await this.technologyModel.findById(id);
    if (!oldTech) throw new NotFoundException('Technology not found');
    const before = oldTech.toObject();

    const technology = await this.technologyModel.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true },
    );
    if (!technology) throw new NotFoundException('Technology not found');

    // Audit Log
    await this.auditLogsService.log({
      action: isPublished ? 'technology.published' : 'technology.unpublished',
      resource: 'Technology',
      resourceId: technology._id.toString(),
      before,
      after: technology.toObject(),
      request: req,
    });

    return technology;
  }

  async remove(id: string, req?: any): Promise<void> {
    const oldTech = await this.technologyModel.findById(id);
    if (!oldTech) throw new NotFoundException('Technology not found');
    const before = oldTech.toObject();

    const technology = await this.technologyModel.findByIdAndDelete(id);
    if (!technology) throw new NotFoundException('Technology not found');
    await this.mediaService.removeUsageForEntity(
      'Technology',
      technology._id.toString(),
    );

    // Audit Log
    await this.auditLogsService.log({
      action: 'technology.deleted',
      resource: 'Technology',
      resourceId: id,
      before,
      request: req,
    });
  }

  async reorder(
    items: { id: string; order: number }[],
    req?: any,
  ): Promise<void> {
    await Promise.all(
      items.map((item) =>
        this.technologyModel
          .updateOne({ _id: item.id }, { order: item.order })
          .exec(),
      ),
    );

    // Audit Log
    await this.auditLogsService.log({
      action: 'technology.reordered',
      resource: 'Technology',
      metadata: { items },
      request: req,
    });
  }
}
