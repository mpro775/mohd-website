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
import { MediaService } from '../media/media.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { generateSlug } from '../../common/utils/slug.util';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<Service>,
    private readonly mediaService: MediaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private generateSlug(name: string): string {
    const slug = generateSlug(name);
    if (!slug) {
      throw new BadRequestException('Slug cannot be empty');
    }
    return slug;
  }

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
    const icons = service.icon ? [service.icon] : [];
    await this.mediaService.syncUsage(
      icons,
      'Service',
      service._id.toString(),
      'icon',
    );
    const ogImages = service.seo?.ogImage ? [service.seo.ogImage] : [];
    await this.mediaService.syncUsage(
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
    const slug = this.generateSlug(
      createServiceDto.slug || createServiceDto.name,
    );
    await this.assertSlugIsAvailable(slug);
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

  async findAll(): Promise<Service[]> {
    return this.serviceModel
      .find({ isPublished: true })
      .sort({ order: 1, name: 1 });
  }

  async findAllAdmin(): Promise<Service[]> {
    return this.serviceModel.find().sort({ order: 1, name: 1 });
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

    const updateData = {
      ...updateServiceDto,
    };
    if (updateServiceDto.name || updateServiceDto.slug) {
      const slug = this.generateSlug(
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
    await this.mediaService.syncUsage(
      [],
      'Service',
      service._id.toString(),
      'icon',
    );
    await this.mediaService.syncUsage(
      [],
      'Service',
      service._id.toString(),
      'seo.ogImage',
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
