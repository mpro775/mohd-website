import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './schemas/audit-log.schema';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  async create(data: Partial<AuditLog>) {
    return this.auditLogModel.create(data);
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.auditLogModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.auditLogModel.countDocuments(),
    ]);
    return createPaginatedResponse(data, total, page, limit);
  }
}
