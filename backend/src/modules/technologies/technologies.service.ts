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
import { MediaService } from '../media/media.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { generateSlug } from '../../common/utils/slug.util';

@Injectable()
export class TechnologiesService {
  constructor(
    @InjectModel(Technology.name) private technologyModel: Model<Technology>,
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
    const existing = await this.technologyModel.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (existing) {
      throw new ConflictException('Technology slug already exists');
    }
  }

  private async syncMedia(technology: Technology) {
    const icons = technology.icon ? [technology.icon] : [];
    await this.mediaService.syncUsage(
      icons,
      'Technology',
      technology._id.toString(),
      'icon',
    );
  }

  async create(
    createTechnologyDto: CreateTechnologyDto,
    req?: any,
  ): Promise<Technology> {
    const slug = this.generateSlug(
      createTechnologyDto.slug || createTechnologyDto.name,
    );
    await this.assertSlugIsAvailable(slug);
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

  async findAllAdmin(category?: string): Promise<Technology[]> {
    const query: any = {};
    if (category) query.category = category;
    return this.technologyModel.find(query).sort({ order: 1, name: 1 });
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

    const updateData = {
      ...updateTechnologyDto,
    };
    if (updateTechnologyDto.name || updateTechnologyDto.slug) {
      const slug = this.generateSlug(
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
    await this.mediaService.syncUsage(
      [],
      'Technology',
      technology._id.toString(),
      'icon',
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
