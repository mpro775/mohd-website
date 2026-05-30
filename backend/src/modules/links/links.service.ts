import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Link } from './schemas/link.schema';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

@Injectable()
export class LinksService {
  constructor(@InjectModel(Link.name) private linkModel: Model<Link>) {}

  async create(createLinkDto: CreateLinkDto): Promise<Link> {
    return new this.linkModel(createLinkDto).save();
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

  async findOne(id: string): Promise<Link> {
    const link = await this.linkModel.findOne({ _id: id, isPublished: true });
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
      { $inc: { clicks: 1 } },
      { new: true },
    );
    if (!link) throw new NotFoundException('Link not found');
    return link;
  }

  async update(id: string, updateLinkDto: UpdateLinkDto): Promise<Link> {
    const link = await this.linkModel.findByIdAndUpdate(id, updateLinkDto, {
      new: true,
    });
    if (!link) throw new NotFoundException('Link not found');
    return link;
  }

  async publish(id: string, isPublished: boolean): Promise<Link> {
    const link = await this.linkModel.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true },
    );
    if (!link) throw new NotFoundException('Link not found');
    return link;
  }

  async remove(id: string): Promise<void> {
    const result = await this.linkModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Link not found');
  }
}
