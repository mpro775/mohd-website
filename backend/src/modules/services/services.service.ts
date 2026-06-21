import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { FilterServiceDto } from './dto/filter-service.dto';
import { MediaService } from '../media/media.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { normalizeSlug } from '../../common/utils/slug.util';
import { buildSafeRegex } from '../../common/utils/regex.util';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { IPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<Service>,
    private readonly mediaService: MediaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private async assertSlugIsAvailable(slug: string, excludeId?: string) {
    const existing = await this.serviceModel.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (existing) {
      throw new ConflictException('Service slug already exists');
    }
  }

  private async syncMedia(service: Service) {
    const icons = service.iconMediaId ? [service.iconMediaId.toString()] : [];
    await this.mediaService.syncUsageByIds(
      icons,
      'Service',
      service._id.toString(),
      'icon',
    );
    const ogImages = service.seo?.ogImageMediaId ? [service.seo.ogImageMediaId.toString()] : [];
    await this.mediaService.syncUsageByIds(
      ogImages,
      'Service',
      service._id.toString(),
      'seo.ogImage',
    );
  }

  async create(
    createServiceDto: CreateServiceDto,
    req?: any,
  ): Promise<Service> {
    const slug = normalizeSlug(
      createServiceDto.slug || createServiceDto.name,
    );
    await this.assertSlugIsAvailable(slug);

    if (createServiceDto.iconMediaId) {
      await this.mediaService.assertMediaExists(createServiceDto.iconMediaId, { type: 'image' });
    }
    if (createServiceDto.seo?.ogImageMediaId) {
      await this.mediaService.assertMediaExists(createServiceDto.seo.ogImageMediaId, { type: 'image' });
    }

    const service = new this.serviceModel({
      ...createServiceDto,
      slug,
    });
    const saved = await service.save();
    await this.syncMedia(saved);

    // Audit Log
    await this.auditLogsService.log({
      action: 'service.created',
      resource: 'Service',
      resourceId: saved._id.toString(),
      after: saved.toObject(),
      request: req,
    });

    return saved;
  }

  async findAll(category?: string): Promise<Service[]> {
    const query: any = { isPublished: true };
    if (category) query.category = category;
    return this.serviceModel.find(query).sort({ order: 1, name: 1 });
  }

  async findAllAdmin(
    queryDto: FilterServiceDto,
  ): Promise<IPaginatedResponse<Service>> {
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
        { shortDescription: searchRegex },
        { detailedDescription: searchRegex },
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
      this.serviceModel
        .find(query)
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.serviceModel.countDocuments(query),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(slug: string): Promise<Service> {
    const service = await this.serviceModel.findOne({
      slug,
      isPublished: true,
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async findOneAdmin(id: string): Promise<Service> {
    const service = await this.serviceModel.findById(id);
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    req?: any,
  ): Promise<Service> {
    const oldService = await this.serviceModel.findById(id);
    if (!oldService) throw new NotFoundException('Service not found');
    const before = oldService.toObject();

    if (updateServiceDto.iconMediaId) {
      await this.mediaService.assertMediaExists(updateServiceDto.iconMediaId, { type: 'image' });
    }
    if (updateServiceDto.seo?.ogImageMediaId) {
      await this.mediaService.assertMediaExists(updateServiceDto.seo.ogImageMediaId, { type: 'image' });
    }

    const updateData = {
      ...updateServiceDto,
    };
    if (updateServiceDto.name || updateServiceDto.slug) {
      const slug = normalizeSlug(
        updateServiceDto.slug || updateServiceDto.name || oldService.slug,
      );
      if (slug !== oldService.slug) {
        await this.assertSlugIsAvailable(slug, id);
        updateData.slug = slug;
      }
    }
    const service = await this.serviceModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!service) throw new NotFoundException('Service not found');
    await this.syncMedia(service);

    // Audit Log
    await this.auditLogsService.log({
      action: 'service.updated',
      resource: 'Service',
      resourceId: service._id.toString(),
      before,
      after: service.toObject(),
      request: req,
    });

    return service;
  }

  async publish(id: string, isPublished: boolean, req?: any): Promise<Service> {
    const oldService = await this.serviceModel.findById(id);
    if (!oldService) throw new NotFoundException('Service not found');
    const before = oldService.toObject();

    const service = await this.serviceModel.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true },
    );
    if (!service) throw new NotFoundException('Service not found');

    // Audit Log
    await this.auditLogsService.log({
      action: isPublished ? 'service.published' : 'service.unpublished',
      resource: 'Service',
      resourceId: service._id.toString(),
      before,
      after: service.toObject(),
      request: req,
    });

    return service;
  }

  async remove(id: string, req?: any): Promise<void> {
    const oldService = await this.serviceModel.findById(id);
    if (!oldService) throw new NotFoundException('Service not found');
    const before = oldService.toObject();

    const service = await this.serviceModel.findByIdAndDelete(id);
    if (!service) throw new NotFoundException('Service not found');
    await this.mediaService.removeUsageForEntity(
      'Service',
      service._id.toString(),
    );

    // Audit Log
    await this.auditLogsService.log({
      action: 'service.deleted',
      resource: 'Service',
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
        this.serviceModel
          .updateOne({ _id: item.id }, { order: item.order })
          .exec(),
      ),
    );

    // Audit Log
    await this.auditLogsService.log({
      action: 'service.reordered',
      resource: 'Service',
      metadata: { items },
      request: req,
    });
  }
}
