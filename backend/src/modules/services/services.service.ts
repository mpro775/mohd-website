import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { MediaService } from '../media/media.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<Service>,
    private readonly mediaService: MediaService,
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
    const service = new this.serviceModel({
      ...createServiceDto,
      slug: createServiceDto.slug || this.generateSlug(createServiceDto.name),
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

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceModel.findOne({
      _id: id,
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
    if (updateServiceDto.name && !updateServiceDto.slug) {
      updateData.slug = this.generateSlug(updateServiceDto.name);
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
