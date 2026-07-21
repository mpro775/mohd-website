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
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { FilterEducationDto } from './dto/filter-education.dto';
import { ReorderEducationDto } from './dto/reorder-education.dto';
import {
  BulkEducationActionDto,
  EducationBulkAction,
} from './dto/bulk-education-action.dto';
import { Education } from './schemas/education.schema';

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
export class EducationService {
  constructor(
    @InjectModel(Education.name)
    private readonly educationModel: Model<Education>,
    private readonly mediaService: MediaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private async assertSlugIsAvailable(slug: string, excludeId?: string) {
    const existing = await this.educationModel
      .exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
      .exec();
    if (existing) throw new ConflictException('رابط المؤهل مستخدم بالفعل');
  }

  private defaultSlug(dto: {
    degree: string;
    fieldOfStudy?: string | null;
    institution: string;
  }) {
    return normalizeSlug(
      `${dto.degree}-${dto.fieldOfStudy?.trim() || ''}-${dto.institution}`,
    );
  }

  private validateDates(
    startDate: Date | undefined,
    endDate: Date | undefined,
    isCurrent: boolean,
  ) {
    if (
      !isCurrent &&
      startDate &&
      endDate &&
      endDate.getTime() < startDate.getTime()
    ) {
      throw new BadRequestException(
        'تاريخ نهاية الدراسة يجب ألا يسبق تاريخ البداية',
      );
    }
  }

  private async validateMedia(dto: UpdateEducationDto) {
    const checks: Promise<unknown>[] = [];
    if (dto.institutionLogoMediaId) {
      checks.push(
        this.mediaService.assertMediaExists(dto.institutionLogoMediaId, {
          type: 'image',
        }),
      );
    }
    if (dto.coverImageMediaId) {
      checks.push(
        this.mediaService.assertMediaExists(dto.coverImageMediaId, {
          type: 'image',
        }),
      );
    }
    if (dto.certificateMediaId) {
      checks.push(
        this.mediaService.assertMediaExists(dto.certificateMediaId, {
          type: 'document',
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

  private async syncMedia(education: Education): Promise<void> {
    const id = education._id.toString();
    await Promise.all([
      this.mediaService.syncUsageByIds(
        education.institutionLogoMediaId
          ? [education.institutionLogoMediaId.toString()]
          : [],
        'Education',
        id,
        'institutionLogo',
      ),
      this.mediaService.syncUsageByIds(
        education.coverImageMediaId
          ? [education.coverImageMediaId.toString()]
          : [],
        'Education',
        id,
        'coverImage',
      ),
      this.mediaService.syncUsageByIds(
        education.certificateMediaId
          ? [education.certificateMediaId.toString()]
          : [],
        'Education',
        id,
        'certificate',
      ),
      this.mediaService.syncUsageByIds(
        education.seo?.ogImageMediaId
          ? [education.seo.ogImageMediaId.toString()]
          : [],
        'Education',
        id,
        'seo.ogImage',
      ),
    ]);
  }

  async create(dto: CreateEducationDto, request?: unknown): Promise<Education> {
    const slug = dto.slug?.trim()
      ? normalizeSlug(dto.slug)
      : this.defaultSlug(dto);
    await this.assertSlugIsAvailable(slug);
    await this.validateMedia(dto);

    const isCurrent = dto.isCurrent ?? false;
    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate =
      !isCurrent && dto.endDate ? new Date(dto.endDate) : undefined;
    this.validateDates(startDate, endDate, isCurrent);

    const payload = cleanCreatePayload({ ...dto });
    payload.slug = slug;
    payload.isCurrent = isCurrent;
    payload.startDate = startDate;
    payload.achievements = cleanUniqueStrings(dto.achievements);
    if (endDate) payload.endDate = endDate;
    else delete payload.endDate;

    try {
      const saved = await new this.educationModel(payload).save();
      await this.syncMedia(saved);
      await this.auditLogsService.log({
        action: 'education.created',
        resource: 'Education',
        resourceId: saved._id.toString(),
        after: saved.toObject(),
        request,
      });
      return saved;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('رابط المؤهل مستخدم بالفعل');
      }
      throw error;
    }
  }

  private buildFilter(
    dto: FilterEducationDto,
    isPublic: boolean,
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = isPublic
      ? { isPublished: true }
      : {};
    if (dto.degreeType) filter.degreeType = dto.degreeType;
    if (dto.institution) filter.institution = buildSafeRegex(dto.institution);
    if (typeof dto.isCurrent === 'boolean') filter.isCurrent = dto.isCurrent;
    if (typeof dto.isFeatured === 'boolean') {
      filter.isFeatured = dto.isFeatured;
    }
    if (!isPublic && typeof dto.isPublished === 'boolean') {
      filter.isPublished = dto.isPublished;
    }
    if (dto.startYear) {
      filter.startDate = {
        $gte: new Date(`${dto.startYear}-01-01T00:00:00.000Z`),
        $lt: new Date(`${dto.startYear + 1}-01-01T00:00:00.000Z`),
      };
    }
    if (dto.endYear) {
      filter.endDate = {
        $gte: new Date(`${dto.endYear}-01-01T00:00:00.000Z`),
        $lt: new Date(`${dto.endYear + 1}-01-01T00:00:00.000Z`),
      };
    }
    const regex = buildSafeRegex(dto.search);
    if (regex) {
      filter.$or = [
        { institution: regex },
        { slug: regex },
        { degree: regex },
        { fieldOfStudy: regex },
        { description: regex },
        { location: regex },
        { achievements: regex },
      ];
    }
    return filter;
  }

  private buildSort(
    dto: FilterEducationDto,
    isPublic: boolean,
  ): Record<string, SortOrder> {
    const allowed = new Set([
      'createdAt',
      'updatedAt',
      'order',
      'institution',
      'degree',
      'degreeType',
      'startDate',
      'endDate',
    ]);
    if (
      isPublic &&
      (!dto.sortBy || (dto.sortBy === 'createdAt' && dto.sortOrder === 'desc'))
    ) {
      return { isFeatured: -1, order: 1, endDate: -1, startDate: -1 };
    }
    const sortBy = allowed.has(dto.sortBy ?? '') ? dto.sortBy! : 'createdAt';
    return { [sortBy]: dto.sortOrder === 'asc' ? 1 : -1 };
  }

  private async findAll(
    dto: FilterEducationDto,
    isPublic: boolean,
  ): Promise<IPaginatedResponse<Education>> {
    const page = Math.max(1, Number(dto.page ?? 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(dto.limit ?? (isPublic ? 12 : 10))),
    );
    const filter = this.buildFilter(dto, isPublic);
    const [data, total] = await Promise.all([
      this.educationModel
        .find(filter)
        .sort(this.buildSort(dto, isPublic))
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<Education[]>()
        .exec(),
      this.educationModel.countDocuments(filter).exec(),
    ]);
    return createPaginatedResponse(data, total, page, limit);
  }

  findAllPublic(
    dto: FilterEducationDto,
  ): Promise<IPaginatedResponse<Education>> {
    return this.findAll(dto, true);
  }

  findAllAdmin(
    dto: FilterEducationDto,
  ): Promise<IPaginatedResponse<Education>> {
    return this.findAll(dto, false);
  }

  async findOnePublic(slug: string): Promise<Education> {
    const item = await this.educationModel
      .findOne({ slug: slug.toLowerCase(), isPublished: true })
      .lean<Education>()
      .exec();
    if (!item) throw new NotFoundException('المؤهل غير موجود');
    return item;
  }

  async findOneAdmin(id: string): Promise<Education> {
    const item = await this.educationModel.findById(id).exec();
    if (!item) throw new NotFoundException('المؤهل غير موجود');
    return item;
  }

  async update(
    id: string,
    dto: UpdateEducationDto,
    request?: unknown,
  ): Promise<Education> {
    const current = await this.findOneAdmin(id);
    if (
      dto.institution === null ||
      dto.degree === null ||
      dto.degreeType === null
    ) {
      throw new BadRequestException('المؤسسة والدرجة ونوعها حقول مطلوبة');
    }
    await this.validateMedia(dto);

    const isCurrent = dto.isCurrent ?? current.isCurrent;
    const startDate =
      dto.startDate === null || dto.startDate === ''
        ? undefined
        : dto.startDate
          ? new Date(dto.startDate)
          : current.startDate;
    const endDate =
      isCurrent || dto.endDate === null || dto.endDate === ''
        ? undefined
        : dto.endDate
          ? new Date(dto.endDate)
          : current.endDate;
    this.validateDates(startDate, endDate, isCurrent);

    const updateInput: Record<string, unknown> = { ...dto };
    if (
      dto.slug !== undefined ||
      dto.degree !== undefined ||
      dto.fieldOfStudy !== undefined ||
      dto.institution !== undefined
    ) {
      const slug = dto.slug?.trim()
        ? normalizeSlug(dto.slug)
        : this.defaultSlug({
            degree: dto.degree?.trim() || current.degree,
            fieldOfStudy:
              dto.fieldOfStudy === null
                ? undefined
                : (dto.fieldOfStudy ?? current.fieldOfStudy),
            institution: dto.institution?.trim() || current.institution,
          });
      await this.assertSlugIsAvailable(slug, id);
      updateInput.slug = slug;
    }
    if (dto.achievements) {
      updateInput.achievements = cleanUniqueStrings(dto.achievements);
    }
    if (dto.startDate !== undefined) updateInput.startDate = startDate ?? null;
    if (dto.endDate !== undefined) updateInput.endDate = endDate ?? null;
    if (isCurrent) updateInput.endDate = null;

    const update = cleanUpdatePayload(updateInput);
    try {
      const saved = await this.educationModel
        .findByIdAndUpdate(id, update, { new: true, runValidators: true })
        .exec();
      if (!saved) throw new NotFoundException('المؤهل غير موجود');
      await this.syncMedia(saved);
      await this.auditLogsService.log({
        action: 'education.updated',
        resource: 'Education',
        resourceId: id,
        before: current.toObject(),
        after: saved.toObject(),
        request,
      });
      return saved;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('رابط المؤهل مستخدم بالفعل');
      }
      throw error;
    }
  }

  private async setFlag(
    id: string,
    field: 'isPublished' | 'isFeatured',
    value: boolean,
    request?: unknown,
  ): Promise<Education> {
    const current = await this.findOneAdmin(id);
    const saved = await this.educationModel
      .findByIdAndUpdate(id, { [field]: value }, { new: true })
      .exec();
    if (!saved) throw new NotFoundException('المؤهل غير موجود');
    const action =
      field === 'isPublished'
        ? value
          ? 'education.published'
          : 'education.unpublished'
        : value
          ? 'education.featured'
          : 'education.unfeatured';
    await this.auditLogsService.log({
      action,
      resource: 'Education',
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

  async reorder(dto: ReorderEducationDto, request?: unknown) {
    const uniqueIds = [...new Set(dto.items.map((item) => item.id))];
    if (uniqueIds.length !== dto.items.length) {
      throw new BadRequestException('لا يمكن تكرار معرّف داخل طلب الترتيب');
    }
    const matched = await this.educationModel
      .countDocuments({ _id: { $in: uniqueIds } })
      .exec();
    if (matched !== uniqueIds.length) {
      throw new BadRequestException('يتضمن طلب الترتيب مؤهلات غير موجودة');
    }
    const result = await this.educationModel.bulkWrite(
      dto.items.map((item) => ({
        updateOne: {
          filter: { _id: new Types.ObjectId(item.id) },
          update: { order: item.order },
        },
      })),
    );
    await this.auditLogsService.log({
      action: 'education.reordered',
      resource: 'Education',
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
    dto: BulkEducationActionDto,
    request?: unknown,
  ): Promise<BulkResult> {
    const ids = [...new Set(dto.ids)];
    let matchedCount = 0;
    let modifiedCount = 0;
    let deletedCount = 0;

    if (dto.action === EducationBulkAction.DELETE) {
      const existing = await this.educationModel
        .find({ _id: { $in: ids } })
        .select('_id')
        .lean<Education[]>()
        .exec();
      matchedCount = existing.length;
      const result = await this.educationModel
        .deleteMany({ _id: { $in: ids } })
        .exec();
      deletedCount = result.deletedCount;
      modifiedCount = deletedCount;
      await Promise.all(
        existing.map((item) =>
          this.mediaService.removeUsageForEntity(
            'Education',
            item._id.toString(),
          ),
        ),
      );
    } else {
      const update =
        dto.action === EducationBulkAction.PUBLISH
          ? { isPublished: true }
          : dto.action === EducationBulkAction.UNPUBLISH
            ? { isPublished: false }
            : dto.action === EducationBulkAction.FEATURE
              ? { isFeatured: true }
              : { isFeatured: false };
      const result = await this.educationModel
        .updateMany({ _id: { $in: ids } }, update)
        .exec();
      matchedCount = result.matchedCount;
      modifiedCount = result.modifiedCount;
    }

    const actionMap: Record<EducationBulkAction, string> = {
      [EducationBulkAction.PUBLISH]: 'education.bulk_published',
      [EducationBulkAction.UNPUBLISH]: 'education.bulk_unpublished',
      [EducationBulkAction.FEATURE]: 'education.bulk_featured',
      [EducationBulkAction.UNFEATURE]: 'education.bulk_unfeatured',
      [EducationBulkAction.DELETE]: 'education.bulk_deleted',
    };
    await this.auditLogsService.log({
      action: actionMap[dto.action],
      resource: 'Education',
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
    await this.educationModel.findByIdAndDelete(id).exec();
    await this.mediaService.removeUsageForEntity('Education', id);
    await this.auditLogsService.log({
      action: 'education.deleted',
      resource: 'Education',
      resourceId: id,
      before: current.toObject(),
      request,
    });
  }
}
