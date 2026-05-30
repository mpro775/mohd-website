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

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<Tag>) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const slug = this.generateSlug(createTagDto.name);

    const existingTag = await this.tagModel.findOne({ slug });
    if (existingTag) {
      throw new ConflictException('الوسم موجود بالفعل');
    }

    const tag = new this.tagModel({
      ...createTagDto,
      slug,
    });

    return tag.save();
  }

  async findAll(): Promise<Tag[]> {
    return this.tagModel.find({ isActive: true }).sort({ name: 1 });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagModel.findById(id);

    if (!tag) {
      throw new NotFoundException('الوسم غير موجود');
    }

    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
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

    return tag;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tagModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('الوسم غير موجود');
    }
  }
}
