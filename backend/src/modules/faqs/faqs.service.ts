import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq } from './schemas/faq.schema';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FilterFaqDto } from './dto/filter-faq.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class FaqsService {
  constructor(
    @InjectModel(Faq.name) private faqModel: Model<Faq>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(dto: CreateFaqDto, req?: any): Promise<Faq> {
    const faq = await this.faqModel.create(dto);
    await this.auditLogsService.log({
      action: 'faq.created',
      resource: 'Faq',
      resourceId: faq._id.toString(),
      after: faq.toObject(),
      request: req,
    });
    return faq;
  }

  async findAllPublic(filterDto: FilterFaqDto) {
    return this.findAll({ ...filterDto, isPublished: true });
  }

  async findAllAdmin(filterDto: FilterFaqDto) {
    return this.findAll(filterDto);
  }

  async findOnePublic(id: string): Promise<Faq> {
    const faq = await this.faqModel.findOne({ _id: id, isPublished: true });
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }
    return faq;
  }

  async findOneAdmin(id: string): Promise<Faq> {
    const faq = await this.faqModel.findById(id);
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }
    return faq;
  }

  async update(id: string, dto: UpdateFaqDto, req?: any): Promise<Faq> {
    const oldFaq = await this.findOneAdmin(id);
    const before = oldFaq.toObject();
    const faq = await this.faqModel.findByIdAndUpdate(id, dto, { new: true });
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    await this.auditLogsService.log({
      action: 'faq.updated',
      resource: 'Faq',
      resourceId: faq._id.toString(),
      before,
      after: faq.toObject(),
      request: req,
    });

    return faq;
  }

  async remove(id: string, req?: any): Promise<void> {
    const faq = await this.findOneAdmin(id);
    const before = faq.toObject();
    await faq.deleteOne();
    await this.auditLogsService.log({
      action: 'faq.deleted',
      resource: 'Faq',
      resourceId: id,
      before,
      request: req,
    });
  }

  private async findAll(filterDto: FilterFaqDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'order',
      sortOrder = 'asc',
      category,
      featured,
      isPublished,
    } = filterDto;

    const query: Record<string, any> = {};
    if (category) query.category = category;
    if (featured !== undefined) query.isFeatured = featured;
    if (isPublished !== undefined) query.isPublished = isPublished;
    if (search) query.$text = { $search: search };

    const allowedSort = ['order', 'createdAt', 'updatedAt', 'question'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'order';
    const skip = (page - 1) * limit;
    const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 } as Record<
      string,
      1 | -1
    >;

    const [data, total] = await Promise.all([
      this.faqModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.faqModel.countDocuments(query),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }
}
