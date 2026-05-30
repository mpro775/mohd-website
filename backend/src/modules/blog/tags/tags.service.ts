import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag } from './schemas/tag.schema';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
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

  async create(createTagDto: CreateTagDto, req?: any): Promise<Tag> {
    const slug = this.generateSlug(createTagDto.name);

    const existingTag = await this.tagModel.findOne({ slug });
    if (existingTag) {
      throw new ConflictException('الوسم موجود بالفعل');
    }

    const tag = new this.tagModel({
      ...createTagDto,
      slug,
    });

    const saved = await tag.save();

    // Audit Log
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

  async findAllAdmin(): Promise<Tag[]> {
    return this.tagModel.find().sort({ name: 1 });
  }

  async findOnePublic(slug: string): Promise<Tag> {
    const tag = await this.tagModel.findOne({ slug, isActive: true });
    if (!tag) {
      throw new NotFoundException('الوسم غير موجود');
    }
    return tag;
  }

  async findOneAdmin(id: string): Promise<Tag> {
    const tag = await this.tagModel.findById(id);
    if (!tag) {
      throw new NotFoundException('الوسم غير موجود');
    }
    return tag;
  }

  async setStatus(id: string, isActive: boolean, req?: any): Promise<Tag> {
    const oldTag = await this.tagModel.findById(id);
    if (!oldTag) {
      throw new NotFoundException('الوسم غير موجود');
    }
    const before = oldTag.toObject();

    const tag = await this.tagModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );
    if (!tag) {
      throw new NotFoundException('الوسم غير موجود');
    }

    // Audit Log
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
      throw new NotFoundException('الوسم غير موجود');
    }
    const before = oldTag.toObject();

    const updateData: any = { ...updateTagDto };

    if (updateTagDto.name) {
      updateData.slug = this.generateSlug(updateTagDto.name);
    }

    const tag = await this.tagModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!tag) {
      throw new NotFoundException('الوسم غير موجود');
    }

    // Audit Log
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
      throw new NotFoundException('الوسم غير موجود');
    }
    const before = oldTag.toObject();

    await this.tagModel.findByIdAndDelete(id);

    // Audit Log
    await this.auditLogsService.log({
      action: 'tag.deleted',
      resource: 'Tag',
      resourceId: id,
      before,
      request: req,
    });
  }
}
