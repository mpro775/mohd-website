import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Link } from './schemas/link.schema';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { MediaService } from '../media/media.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { generateSlug } from '../../common/utils/slug.util';

@Injectable()
export class LinksService {
  constructor(
    @InjectModel(Link.name) private linkModel: Model<Link>,
    private readonly mediaService: MediaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private generateSlug(title: string): string {
    const slug = generateSlug(title);
    if (!slug) {
      throw new BadRequestException('Slug cannot be empty');
    }
    return slug;
  }

  private async assertSlugIsAvailable(slug: string, excludeId?: string) {
    const existing = await this.linkModel.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (existing) {
      throw new ConflictException('Link slug already exists');
    }
  }

  private async syncMedia(link: Link) {
    const icons = link.icon ? [link.icon] : [];
    await this.mediaService.syncUsage(
      icons,
      'Link',
      link._id.toString(),
      'icon',
    );
  }

  async create(createLinkDto: CreateLinkDto, req?: any): Promise<Link> {
    const slug = this.generateSlug(createLinkDto.slug || createLinkDto.title);
    await this.assertSlugIsAvailable(slug);
    const link = new this.linkModel({
      ...createLinkDto,
      slug,
    });
    const saved = await link.save();
    await this.syncMedia(saved);

    // Audit Log
    await this.auditLogsService.log({
      action: 'link.created',
      resource: 'Link',
      resourceId: saved._id.toString(),
      after: saved.toObject(),
      request: req,
    });

    return saved;
  }

  async findAll(category?: string): Promise<Link[]> {
    const query: any = { isPublished: true };
    if (category) query.category = category;
    return this.linkModel.find(query).sort({ order: 1, title: 1 });
  }

  async findAllAdmin(category?: string): Promise<Link[]> {
    const query: any = {};
    if (category) query.category = category;
    return this.linkModel.find(query).sort({ order: 1, title: 1 });
  }

  async findOne(slug: string): Promise<Link> {
    const link = await this.linkModel.findOne({ slug, isPublished: true });
    if (!link) throw new NotFoundException('Link not found');
    return link;
  }

  async findOneAdmin(id: string): Promise<Link> {
    const link = await this.linkModel.findById(id);
    if (!link) throw new NotFoundException('Link not found');
    return link;
  }

  async trackClick(id: string): Promise<Link> {
    const link = await this.linkModel.findOneAndUpdate(
      { _id: id, isPublished: true },
      { $inc: { clicks: 1 }, lastClickedAt: new Date() },
      { new: true },
    );
    if (!link) throw new NotFoundException('Link not found');
    return link;
  }

  async update(
    id: string,
    updateLinkDto: UpdateLinkDto,
    req?: any,
  ): Promise<Link> {
    const oldLink = await this.linkModel.findById(id);
    if (!oldLink) throw new NotFoundException('Link not found');
    const before = oldLink.toObject();

    const updateData = {
      ...updateLinkDto,
    };
    if (updateLinkDto.title || updateLinkDto.slug) {
      const slug = this.generateSlug(
        updateLinkDto.slug || updateLinkDto.title || oldLink.slug,
      );
      if (slug !== oldLink.slug) {
        await this.assertSlugIsAvailable(slug, id);
        updateData.slug = slug;
      }
    }
    const link = await this.linkModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!link) throw new NotFoundException('Link not found');
    await this.syncMedia(link);

    // Audit Log
    await this.auditLogsService.log({
      action: 'link.updated',
      resource: 'Link',
      resourceId: link._id.toString(),
      before,
      after: link.toObject(),
      request: req,
    });

    return link;
  }

  async publish(id: string, isPublished: boolean, req?: any): Promise<Link> {
    const oldLink = await this.linkModel.findById(id);
    if (!oldLink) throw new NotFoundException('Link not found');
    const before = oldLink.toObject();

    const link = await this.linkModel.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true },
    );
    if (!link) throw new NotFoundException('Link not found');

    // Audit Log
    await this.auditLogsService.log({
      action: isPublished ? 'link.published' : 'link.unpublished',
      resource: 'Link',
      resourceId: link._id.toString(),
      before,
      after: link.toObject(),
      request: req,
    });

    return link;
  }

  async remove(id: string, req?: any): Promise<void> {
    const oldLink = await this.linkModel.findById(id);
    if (!oldLink) throw new NotFoundException('Link not found');
    const before = oldLink.toObject();

    const link = await this.linkModel.findByIdAndDelete(id);
    if (!link) throw new NotFoundException('Link not found');
    await this.mediaService.syncUsage([], 'Link', link._id.toString(), 'icon');

    // Audit Log
    await this.auditLogsService.log({
      action: 'link.deleted',
      resource: 'Link',
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
        this.linkModel
          .updateOne({ _id: item.id }, { order: item.order })
          .exec(),
      ),
    );

    // Audit Log
    await this.auditLogsService.log({
      action: 'link.reordered',
      resource: 'Link',
      metadata: { items },
      request: req,
    });
  }
}
