import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { MediaService } from '../media/media.service';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { buildSafeRegex } from '../../common/utils/regex.util';
import { normalizeSlug } from '../../common/utils/slug.util';
import {
  cleanCreatePayload,
  cleanUniqueStrings,
  cleanUpdatePayload,
} from '../../common/utils/clean-update-payload.util';
import { IPaginatedResponse } from '../../common/dto/pagination.dto';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { FilterCertificationDto } from './dto/filter-certification.dto';
import { ReorderCertificationsDto } from './dto/reorder-certifications.dto';
import {
  BulkCertificationActionDto,
  CertificationBulkAction,
} from './dto/bulk-certification-action.dto';
import { Certification } from './schemas/certification.schema';

type BulkResult = {
  matchedCount: number;
  modifiedCount: number;
  deletedCount: number;
};

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  );
}

@Injectable()
export class CertificationsService {
  constructor(
    @InjectModel(Certification.name)
    private readonly certificationModel: Model<Certification>,
    private readonly mediaService: MediaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private async assertSlugIsAvailable(slug: string, excludeId?: string) {
    const existing = await this.certificationModel
      .exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
      .exec();
    if (existing) {
      throw new ConflictException('رابط الشهادة مستخدم بالفعل');
    }
  }

  private validateDates(
    issuedAt: Date | undefined,
    expiresAt: Date | undefined,
    doesNotExpire: boolean,
  ) {
    if (
      !doesNotExpire &&
      issuedAt &&
      expiresAt &&
      expiresAt.getTime() < issuedAt.getTime()
    ) {
      throw new BadRequestException(
        'تاريخ انتهاء الشهادة يجب ألا يسبق تاريخ الإصدار',
      );
    }
  }

  private async validateMedia(dto: UpdateCertificationDto) {
    const checks: Promise<unknown>[] = [];
    if (dto.imageMediaId) {
      checks.push(
        this.mediaService.assertMediaExists(dto.imageMediaId, {
          type: 'image',
        }),
      );
    }
    if (dto.documentMediaId) {
      checks.push(
        this.mediaService.assertMediaExists(dto.documentMediaId, {
          type: 'document',
        }),
      );
    }
    if (dto.issuerLogoMediaId) {
      checks.push(
        this.mediaService.assertMediaExists(dto.issuerLogoMediaId, {
          type: 'image',
        }),
      );
    }
    if (dto.seo?.ogImageMediaId) {
      checks.push(
        this.mediaService.assertMediaExists(dto.seo.ogImageMediaId, {
          type: 'image',
        }),
      );
    }
    try {
      await Promise.all(checks);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  private async syncMedia(certification: Certification): Promise<void> {
    const id = certification._id.toString();
    await Promise.all([
      this.mediaService.syncUsageByIds(
        certification.imageMediaId
          ? [certification.imageMediaId.toString()]
          : [],
        'Certification',
        id,
        'image',
      ),
      this.mediaService.syncUsageByIds(
        certification.documentMediaId
          ? [certification.documentMediaId.toString()]
          : [],
        'Certification',
        id,
        'document',
      ),
      this.mediaService.syncUsageByIds(
        certification.issuerLogoMediaId
          ? [certification.issuerLogoMediaId.toString()]
          : [],
        'Certification',
        id,
        'issuerLogo',
      ),
      this.mediaService.syncUsageByIds(
        certification.seo?.ogImageMediaId
          ? [certification.seo.ogImageMediaId.toString()]
          : [],
        'Certification',
        id,
        'seo.ogImage',
      ),
    ]);
  }

  async create(
    dto: CreateCertificationDto,
    request?: unknown,
  ): Promise<Certification> {
    const slug = normalizeSlug(dto.slug?.trim() || dto.title);
    await this.assertSlugIsAvailable(slug);
    await this.validateMedia(dto);

    const doesNotExpire = dto.doesNotExpire ?? true;
    const issuedAt = dto.issuedAt ? new Date(dto.issuedAt) : undefined;
    const expiresAt =
      !doesNotExpire && dto.expiresAt ? new Date(dto.expiresAt) : undefined;
    this.validateDates(issuedAt, expiresAt, doesNotExpire);

    const payload = cleanCreatePayload({ ...dto });
    payload.slug = slug;
    payload.doesNotExpire = doesNotExpire;
    payload.issuedAt = issuedAt;
    payload.skills = cleanUniqueStrings(dto.skills);
    if (expiresAt) payload.expiresAt = expiresAt;
    else delete payload.expiresAt;

    try {
      const saved = await new this.certificationModel(payload).save();
      await this.syncMedia(saved);
      await this.auditLogsService.log({
        action: 'certification.created',
        resource: 'Certification',
        resourceId: saved._id.toString(),
        after: saved.toObject(),
        request,
      });
      return saved;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('رابط الشهادة مستخدم بالفعل');
      }
      throw error;
    }
  }

  private buildFilter(
    dto: FilterCertificationDto,
    isPublic: boolean,
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = isPublic
      ? { isPublished: true }
      : {};
    if (dto.type) filter.type = dto.type;
    if (dto.category) filter.category = buildSafeRegex(dto.category);
    if (dto.platform) filter.platform = buildSafeRegex(dto.platform);
    if (dto.issuer) filter.issuer = buildSafeRegex(dto.issuer);
    if (typeof dto.isFeatured === 'boolean') {
      filter.isFeatured = dto.isFeatured;
    }
    if (!isPublic && typeof dto.isPublished === 'boolean') {
      filter.isPublished = dto.isPublished;
    }
    if (dto.year) {
      filter.issuedAt = {
        $gte: new Date(`${dto.year}-01-01T00:00:00.000Z`),
        $lt: new Date(`${dto.year + 1}-01-01T00:00:00.000Z`),
      };
    }
    const regex = buildSafeRegex(dto.search);
    if (regex) {
      filter.$or = [
        { title: regex },
        { slug: regex },
        { issuer: regex },
        { platform: regex },
        { description: regex },
        { credentialId: regex },
        { skills: regex },
      ];
    }
    return filter;
  }

  private buildSort(
    dto: FilterCertificationDto,
    isPublic: boolean,
  ): Record<string, SortOrder> {
    const allowed = new Set([
      'createdAt',
      'updatedAt',
      'order',
      'title',
      'issuer',
      'platform',
      'issuedAt',
      'type',
    ]);
    if (
      isPublic &&
      (!dto.sortBy || (dto.sortBy === 'createdAt' && dto.sortOrder === 'desc'))
    ) {
      return { isFeatured: -1, order: 1, issuedAt: -1, createdAt: -1 };
    }
    const sortBy = allowed.has(dto.sortBy ?? '') ? dto.sortBy! : 'createdAt';
    return { [sortBy]: dto.sortOrder === 'asc' ? 1 : -1 };
  }

  private async findAll(
    dto: FilterCertificationDto,
    isPublic: boolean,
  ): Promise<IPaginatedResponse<Certification>> {
    const page = Math.max(1, Number(dto.page ?? 1));
    const defaultLimit = isPublic ? 12 : 10;
    const limit = Math.min(100, Math.max(1, Number(dto.limit ?? defaultLimit)));
    const filter = this.buildFilter(dto, isPublic);
    const [data, total] = await Promise.all([
      this.certificationModel
        .find(filter)
        .sort(this.buildSort(dto, isPublic))
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<Certification[]>()
        .exec(),
      this.certificationModel.countDocuments(filter).exec(),
    ]);
    return createPaginatedResponse(data, total, page, limit);
  }

  findAllPublic(
    dto: FilterCertificationDto,
  ): Promise<IPaginatedResponse<Certification>> {
    return this.findAll(dto, true);
  }

  findAllAdmin(
    dto: FilterCertificationDto,
  ): Promise<IPaginatedResponse<Certification>> {
    return this.findAll(dto, false);
  }

  async findOnePublic(slug: string): Promise<Certification> {
    const item = await this.certificationModel
      .findOne({ slug: slug.toLowerCase(), isPublished: true })
      .lean<Certification>()
      .exec();
    if (!item) throw new NotFoundException('الشهادة غير موجودة');
    return item;
  }

  async findOneAdmin(id: string): Promise<Certification> {
    const item = await this.certificationModel.findById(id).exec();
    if (!item) throw new NotFoundException('الشهادة غير موجودة');
    return item;
  }

  async update(
    id: string,
    dto: UpdateCertificationDto,
    request?: unknown,
  ): Promise<Certification> {
    const current = await this.findOneAdmin(id);
    if (dto.title === null || dto.issuer === null || dto.type === null) {
      throw new BadRequestException(
        'العنوان والنوع والجهة المانحة حقول مطلوبة',
      );
    }
    await this.validateMedia(dto);

    const doesNotExpire = dto.doesNotExpire ?? current.doesNotExpire;
    const issuedAt =
      dto.issuedAt === null || dto.issuedAt === ''
        ? undefined
        : dto.issuedAt
          ? new Date(dto.issuedAt)
          : current.issuedAt;
    const expiresAt =
      doesNotExpire || dto.expiresAt === null || dto.expiresAt === ''
        ? undefined
        : dto.expiresAt
          ? new Date(dto.expiresAt)
          : current.expiresAt;
    this.validateDates(issuedAt, expiresAt, doesNotExpire);

    const updateInput: Record<string, unknown> = { ...dto };
    if (dto.slug !== undefined || dto.title !== undefined) {
      const slug = normalizeSlug(
        dto.slug?.trim() || dto.title?.trim() || current.title,
      );
      await this.assertSlugIsAvailable(slug, id);
      updateInput.slug = slug;
    }
    if (dto.skills) updateInput.skills = cleanUniqueStrings(dto.skills);
    if (dto.issuedAt !== undefined) updateInput.issuedAt = issuedAt ?? null;
    if (dto.expiresAt !== undefined) updateInput.expiresAt = expiresAt ?? null;
    if (doesNotExpire) updateInput.expiresAt = null;

    const update = cleanUpdatePayload(updateInput);
    try {
      const saved = await this.certificationModel
        .findByIdAndUpdate(id, update, { new: true, runValidators: true })
        .exec();
      if (!saved) throw new NotFoundException('الشهادة غير موجودة');
      await this.syncMedia(saved);
      await this.auditLogsService.log({
        action: 'certification.updated',
        resource: 'Certification',
        resourceId: id,
        before: current.toObject(),
        after: saved.toObject(),
        request,
      });
      return saved;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('رابط الشهادة مستخدم بالفعل');
      }
      throw error;
    }
  }

  private async setFlag(
    id: string,
    field: 'isPublished' | 'isFeatured',
    value: boolean,
    request?: unknown,
  ): Promise<Certification> {
    const current = await this.findOneAdmin(id);
    const saved = await this.certificationModel
      .findByIdAndUpdate(id, { [field]: value }, { new: true })
      .exec();
    if (!saved) throw new NotFoundException('الشهادة غير موجودة');
    const action =
      field === 'isPublished'
        ? value
          ? 'certification.published'
          : 'certification.unpublished'
        : value
          ? 'certification.featured'
          : 'certification.unfeatured';
    await this.auditLogsService.log({
      action,
      resource: 'Certification',
      resourceId: id,
      before: current.toObject(),
      after: saved.toObject(),
      request,
    });
    return saved;
  }

  setPublished(id: string, value: boolean, request?: unknown) {
    return this.setFlag(id, 'isPublished', value, request);
  }

  setFeatured(id: string, value: boolean, request?: unknown) {
    return this.setFlag(id, 'isFeatured', value, request);
  }

  async reorder(dto: ReorderCertificationsDto, request?: unknown) {
    const uniqueIds = [...new Set(dto.items.map((item) => item.id))];
    if (uniqueIds.length !== dto.items.length) {
      throw new BadRequestException('لا يمكن تكرار معرّف داخل طلب الترتيب');
    }
    const matched = await this.certificationModel
      .countDocuments({ _id: { $in: uniqueIds } })
      .exec();
    if (matched !== uniqueIds.length) {
      throw new BadRequestException('يتضمن طلب الترتيب شهادات غير موجودة');
    }
    const result = await this.certificationModel.bulkWrite(
      dto.items.map((item) => ({
        updateOne: {
          filter: { _id: new Types.ObjectId(item.id) },
          update: { order: item.order },
        },
      })),
    );
    await this.auditLogsService.log({
      action: 'certification.reordered',
      resource: 'Certification',
      metadata: {
        items: dto.items,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
      request,
    });
    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  async bulkAction(
    dto: BulkCertificationActionDto,
    request?: unknown,
  ): Promise<BulkResult> {
    const ids = [...new Set(dto.ids)];
    let matchedCount = 0;
    let modifiedCount = 0;
    let deletedCount = 0;

    if (dto.action === CertificationBulkAction.DELETE) {
      const existing = await this.certificationModel
        .find({ _id: { $in: ids } })
        .select('_id')
        .lean<Certification[]>()
        .exec();
      matchedCount = existing.length;
      const result = await this.certificationModel
        .deleteMany({ _id: { $in: ids } })
        .exec();
      deletedCount = result.deletedCount;
      modifiedCount = deletedCount;
      await Promise.all(
        existing.map((item) =>
          this.mediaService.removeUsageForEntity(
            'Certification',
            item._id.toString(),
          ),
        ),
      );
    } else {
      const update =
        dto.action === CertificationBulkAction.PUBLISH
          ? { isPublished: true }
          : dto.action === CertificationBulkAction.UNPUBLISH
            ? { isPublished: false }
            : dto.action === CertificationBulkAction.FEATURE
              ? { isFeatured: true }
              : { isFeatured: false };
      const result = await this.certificationModel
        .updateMany({ _id: { $in: ids } }, update)
        .exec();
      matchedCount = result.matchedCount;
      modifiedCount = result.modifiedCount;
    }

    const actionMap: Record<CertificationBulkAction, string> = {
      [CertificationBulkAction.PUBLISH]: 'certification.bulk_published',
      [CertificationBulkAction.UNPUBLISH]: 'certification.bulk_unpublished',
      [CertificationBulkAction.FEATURE]: 'certification.bulk_featured',
      [CertificationBulkAction.UNFEATURE]: 'certification.bulk_unfeatured',
      [CertificationBulkAction.DELETE]: 'certification.bulk_deleted',
    };
    await this.auditLogsService.log({
      action: actionMap[dto.action],
      resource: 'Certification',
      metadata: {
        action: dto.action,
        ids,
        matchedCount,
        modifiedCount,
        deletedCount,
      },
      request,
    });
    return { matchedCount, modifiedCount, deletedCount };
  }

  async remove(id: string, request?: unknown): Promise<void> {
    const current = await this.findOneAdmin(id);
    await this.certificationModel.findByIdAndDelete(id).exec();
    await this.mediaService.removeUsageForEntity('Certification', id);
    await this.auditLogsService.log({
      action: 'certification.deleted',
      resource: 'Certification',
      resourceId: id,
      before: current.toObject(),
      request,
    });
  }
}
