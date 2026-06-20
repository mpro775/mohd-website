import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { AuditLog } from './schemas/audit-log.schema';
import { FilterAuditLogDto } from './dto/filter-audit-log.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { buildSafeRegex } from '../../common/utils/regex.util';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  private sanitize(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    const sanitized: Record<string, any> = {};
    const sensitiveKeys = [
      'password',
      'currentpassword',
      'newpassword',
      'refreshtoken',
      'accesstoken',
      'authorization',
      'resettoken',
      'tokenhash',
      'jwt',
      'secret',
      'accesskey',
    ];

    for (const key of Object.keys(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some((sk) => lowerKey.includes(sk));
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = this.sanitize(obj[key]);
      }
    }

    return sanitized;
  }

  async log(params: {
    action: string;
    resource: string;
    resourceId?: string;
    before?: any;
    after?: any;
    metadata?: any;
    request?: any;
  }) {
    try {
      const { action, resource, resourceId, before, after, metadata, request } =
        params;

      let actorId: any = undefined;
      let actorEmail: string | undefined = undefined;
      let ipAddress: string | undefined = undefined;
      let userAgent: string | undefined = undefined;

      if (request) {
        if (request.user) {
          actorId = request.user.userId || request.user.id || request.user._id;
          actorEmail = request.user.email;
        }
        ipAddress =
          request.ip ||
          request.headers?.['x-forwarded-for'] ||
          request.connection?.remoteAddress;
        userAgent = request.headers?.['user-agent'];
      }

      // Deeply clone and sanitize documents
      const cleanBefore = before
        ? this.sanitize(JSON.parse(JSON.stringify(before)))
        : undefined;
      const cleanAfter = after
        ? this.sanitize(JSON.parse(JSON.stringify(after)))
        : undefined;
      const cleanMetadata = metadata
        ? this.sanitize(JSON.parse(JSON.stringify(metadata)))
        : undefined;

      const logData = {
        actorId,
        actorEmail,
        action,
        resource,
        resourceId,
        ipAddress,
        userAgent,
        before: cleanBefore,
        after: cleanAfter,
        metadata: cleanMetadata,
      };

      await this.auditLogModel.create(logData);
    } catch (err) {
      // Failure to write audit logs must never break main execution
      this.logger.error('Failed to create audit log:', err);
    }
  }

  async findAll(queryDto: FilterAuditLogDto) {
    const page = Number(queryDto.page ?? 1);
    const limit = Number(queryDto.limit ?? 20);
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    if (queryDto.action) query.action = queryDto.action;
    if (queryDto.resource) query.resource = queryDto.resource;
    if (queryDto.actorId && isValidObjectId(queryDto.actorId))
      query.actorId = queryDto.actorId;
    if (queryDto.resourceId) query.resourceId = queryDto.resourceId;

    if (queryDto.actorEmail) {
      const emailRegex = buildSafeRegex(queryDto.actorEmail);
      if (emailRegex) query.actorEmail = emailRegex;
    }

    if (queryDto.dateFrom || queryDto.dateTo) {
      query.createdAt = {};
      if (queryDto.dateFrom) query.createdAt.$gte = new Date(queryDto.dateFrom);
      if (queryDto.dateTo) query.createdAt.$lte = new Date(queryDto.dateTo);
    }

    const searchRegex = buildSafeRegex(queryDto.search);
    if (searchRegex) {
      query.$or = [
        { action: searchRegex },
        { resource: searchRegex },
        { actorEmail: searchRegex },
        { resourceId: searchRegex },
      ];
    }

    const ALLOWED_SORT_FIELDS = [
      'createdAt',
      'updatedAt',
      'action',
      'resource',
      'actorEmail',
    ];
    const sortBy = ALLOWED_SORT_FIELDS.includes(queryDto.sortBy ?? '')
      ? (queryDto.sortBy as string)
      : 'createdAt';
    const sortOrder = queryDto.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder } as Record<string, 1 | -1>;

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .populate('actorId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      this.auditLogModel.countDocuments(query),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<AuditLog> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('معرّف السجل غير صالح');
    }
    const log = await this.auditLogModel
      .findById(id)
      .populate('actorId', 'name email');
    if (!log) {
      throw new NotFoundException('السجل المطلوب غير موجود');
    }
    return log;
  }
}
