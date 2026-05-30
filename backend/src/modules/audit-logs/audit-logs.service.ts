import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { AuditLog } from './schemas/audit-log.schema';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

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

  async findAll(queryDto: any) {
    const {
      page = 1,
      limit = 20,
      action,
      resource,
      actorId,
      resourceId,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const ALLOWED_SORT_FIELDS = [
      'createdAt',
      'action',
      'resource',
      'actorEmail',
    ];
    if (sortBy && !ALLOWED_SORT_FIELDS.includes(sortBy)) {
      throw new BadRequestException(`Sorting by ${sortBy} is not allowed`);
    }

    const query: Record<string, any> = {};

    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (actorId && isValidObjectId(actorId)) query.actorId = actorId;
    if (resourceId) query.resourceId = resourceId;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 } as Record<
      string,
      1 | -1
    >;

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .populate('actorId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      this.auditLogModel.countDocuments(query),
    ]);

    return createPaginatedResponse(data, total, Number(page), Number(limit));
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
