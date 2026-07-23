import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Model, isValidObjectId, Types } from 'mongoose';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { Media } from './schemas/media.schema';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaQueryDto } from './dto/media-query.dto';
import { UpdateMediaMetadataDto } from './dto/update-media-metadata.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { buildSafeRegex } from '../../common/utils/regex.util';

const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const ALLOWED_DOC_MIMES = ['application/pdf'];
const STATIC_IMAGE_MAX_FILE_SIZE = 5 * 1024 * 1024;
const DOCUMENT_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_UPLOAD_FILE_SIZE = 15 * 1024 * 1024;

const SHARP_FORMAT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export interface RequestWithOptionalUser {
  user?: {
    userId?: string;
    id?: string;
    _id?: string;
  };
}

export type ResolvedMedia = {
  id: string;
  key: string;
  url: string;
  alt?: string;
  type: 'image' | 'document';
  folder: string;
  mimeType: string;
  width?: number;
  height?: number;
};

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly s3?: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly auditLogsService: AuditLogsService,
    @InjectModel(Media.name) private readonly mediaModel: Model<Media>,
  ) {
    this.bucket = this.configService.get<string>('cloudflare.r2.bucket') ?? '';
    this.publicUrl = (
      this.configService.get<string>('cloudflare.r2.publicUrl') ?? ''
    ).replace(/\/$/, '');

    const endpoint =
      this.configService.get<string>('cloudflare.r2.endpoint') ?? '';
    const accessKeyId =
      this.configService.get<string>('cloudflare.r2.accessKeyId') ?? '';
    const secretAccessKey =
      this.configService.get<string>('cloudflare.r2.secretAccessKey') ?? '';
    const region =
      this.configService.get<string>('cloudflare.r2.region') || 'auto';

    if (this.isStorageConfigured(accessKeyId, secretAccessKey, endpoint)) {
      this.s3 = new S3Client({
        region,
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  async upload(
    file: Express.Multer.File,
    dto: UploadMediaDto,
    req?: RequestWithOptionalUser,
  ): Promise<Media> {
    if (!file) {
      throw new BadRequestException('يجب توفير الملف المراد رفعه');
    }
    if (!dto || !dto.folder) {
      throw new BadRequestException('يجب تحديد مجلد الرفع');
    }

    const isImage = ALLOWED_IMAGE_MIMES.includes(file.mimetype);
    const isPdf = ALLOWED_DOC_MIMES.includes(file.mimetype);

    if (!isImage && !isPdf) {
      throw new BadRequestException(
        'نوع الملف غير مدعوم. الأنواع المسموحة هي: jpeg, png, webp, gif, pdf',
      );
    }

    const initialSizeLimit = isPdf
      ? DOCUMENT_MAX_FILE_SIZE
      : file.mimetype === 'image/gif' || file.mimetype === 'image/webp'
        ? MAX_UPLOAD_FILE_SIZE
        : STATIC_IMAGE_MAX_FILE_SIZE;
    if (file.size > initialSizeLimit) {
      throw new BadRequestException(
        isPdf
          ? 'حجم ملف PDF يتجاوز الحد الأقصى المسموح به وهو 10 ميجابايت'
          : file.mimetype === 'image/gif' || file.mimetype === 'image/webp'
            ? 'حجم الصورة المتحركة يتجاوز الحد الأقصى المسموح به وهو 15 ميجابايت'
            : 'حجم الصورة الثابتة يتجاوز الحد الأقصى المسموح به وهو 5 ميجابايت',
      );
    }

    let fileBuffer = file.buffer;
    let finalMimeType = file.mimetype;
    let width: number | undefined;
    let height: number | undefined;
    let extension = extname(file.originalname).toLowerCase();

    // 2. Real signature checks (Real MIME check)
    if (isPdf) {
      const isRealPdf = file.buffer.toString('ascii', 0, 5) === '%PDF-';
      if (!isRealPdf) {
        throw new BadRequestException('محتوى الملف غير صالح كملف PDF حقيقي');
      }
    } else if (isImage) {
      try {
        // Read every frame for reliable animated GIF/WebP detection.
        const metadata = await sharp(file.buffer, {
          animated: true,
        }).metadata();

        if (metadata.format !== SHARP_FORMAT_BY_MIME[file.mimetype]) {
          throw new BadRequestException('محتوى الصورة غير صالح أو غير مدعوم');
        }

        const isAnimated = (metadata.pages ?? 1) > 1;
        if (metadata.format === 'png' && isAnimated) {
          throw new BadRequestException(
            'PNG المتحرك غير مدعوم. استخدم GIF أو Animated WebP',
          );
        }

        if (
          metadata.format === 'webp' &&
          !isAnimated &&
          file.size > STATIC_IMAGE_MAX_FILE_SIZE
        ) {
          throw new BadRequestException(
            'حجم الصورة الثابتة يتجاوز الحد الأقصى المسموح به وهو 5 ميجابايت',
          );
        }

        const preserveOriginal =
          metadata.format === 'gif' ||
          (metadata.format === 'webp' && isAnimated);

        if (preserveOriginal) {
          fileBuffer = file.buffer;
          finalMimeType = `image/${metadata.format}`;
          extension = `.${metadata.format}`;
          width = metadata.width;
          height = metadata.pageHeight ?? metadata.height;
        } else {
          // Static JPEG, PNG and WebP files are normalized and optimized as WebP.
          fileBuffer = await sharp(file.buffer)
            .rotate()
            .webp({ quality: 82 })
            .toBuffer();
          finalMimeType = 'image/webp';
          extension = '.webp';
          const outputMetadata = await sharp(fileBuffer).metadata();
          width = outputMetadata.width;
          height = outputMetadata.height;
        }
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        throw new BadRequestException('محتوى ملف الصورة غير صالح');
      }
    }

    // 3. Build filename and storage key
    const baseName =
      file.originalname.substring(0, file.originalname.lastIndexOf('.')) ||
      file.originalname;
    const cleanBase = baseName
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
    const filename = `${cleanBase}${extension}`;

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const uuid = randomUUID().replace(/-/g, '').slice(0, 12);
    const key = `${dto.folder}/${yyyy}/${mm}/${uuid}${extension}`;

    // 4. Upload to Cloudflare R2
    const s3 = this.getStorageClient();
    await s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: finalMimeType,
      }),
    );

    const userId = this.getRequestUserId(req);

    // 5. Save to MongoDB
    const createdMedia = await this.mediaModel.create({
      filename,
      originalName: file.originalname,
      key,
      url: `${this.publicUrl}/${key}`,
      mimeType: finalMimeType,
      size: fileBuffer.length,
      provider: 'r2',
      folder: dto.folder,
      type: isPdf ? 'document' : 'image',
      width,
      height,
      alt: dto.alt || '',
      usage: dto.usage || '',
      uploadedBy: userId ? new Types.ObjectId(userId) : undefined,
      isUsed: false,
      usedIn: [],
    });

    // 6. Log Audit Log
    await this.auditLogsService.log({
      action: 'media.uploaded',
      resource: 'Media',
      resourceId: createdMedia._id.toString(),
      after: createdMedia.toObject(),
      metadata: {
        filename: createdMedia.filename,
        key: createdMedia.key,
        folder: createdMedia.folder,
        size: createdMedia.size,
      },
      request: req,
    });

    return createdMedia;
  }

  async findAll(query: MediaQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.folder) filter.folder = query.folder;
    if (query.type) filter.type = query.type;
    if (query.mimeType) filter.mimeType = query.mimeType;
    if (query.isUsed !== undefined) filter.isUsed = query.isUsed;

    // Search query: filters in filename, originalName, alt, usage
    const searchRegex = buildSafeRegex(query.search);
    if (searchRegex) {
      filter.$or = [
        { filename: searchRegex },
        { originalName: searchRegex },
        { alt: searchRegex },
        { usage: searchRegex },
      ];
    }

    // Sort configuration and whitelist
    const sortWhitelist = [
      'createdAt',
      'updatedAt',
      'filename',
      'size',
      'mimeType',
      'folder',
      'type',
    ];
    const sortBy = sortWhitelist.includes(query.sortBy ?? '')
      ? (query.sortBy as string)
      : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sortObj: Record<string, any> = { [sortBy]: sortOrder };

    const [data, total] = await Promise.all([
      this.mediaModel.find(filter).sort(sortObj).skip(skip).limit(limit),
      this.mediaModel.countDocuments(filter),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<Media> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('معرّف الملف غير صالح');
    }
    const media = await this.mediaModel.findById(id);
    if (!media) {
      throw new NotFoundException('الملف المطلوب غير موجود');
    }
    return media;
  }

  async updateMetadata(
    id: string,
    dto: UpdateMediaMetadataDto,
    req?: any,
  ): Promise<Media> {
    const media = await this.findOne(id);
    const before = media.toObject();
    const oldState = {
      alt: media.alt,
      usage: media.usage,
      folder: media.folder,
    };

    // Update only allowed fields
    if (dto.alt !== undefined) media.alt = dto.alt;
    if (dto.usage !== undefined) media.usage = dto.usage;
    if (dto.folder !== undefined) media.folder = dto.folder;

    const saved = await media.save();

    // Log Audit Log
    await this.auditLogsService.log({
      action: 'media.updated',
      resource: 'Media',
      resourceId: media._id.toString(),
      before,
      after: saved.toObject(),
      metadata: {
        oldState,
        newState: {
          alt: saved.alt,
          usage: saved.usage,
          folder: saved.folder,
        },
      },
      request: req,
    });

    return saved;
  }

  async remove(id: string, req?: any): Promise<void> {
    const media = await this.findOne(id);

    // Prevent deletion of files in active use
    if (media.isUsed) {
      throw new BadRequestException(
        'لا يمكن حذف هذا الملف لأنه مستخدم في الموقع حالياً. يرجى إزالته من الموارد المرتبطة أولاً.',
      );
    }

    let r2Deleted = true;
    let r2Error: any = null;
    // Delete from Cloudflare R2
    try {
      const s3 = this.getStorageClient();
      await s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: media.key,
        }),
      );
    } catch (e) {
      r2Deleted = false;
      r2Error = e instanceof Error ? e.message : 'R2 delete failed';
      // Log warning but proceed with MongoDB removal if R2 deletes fail to avoid dangling DB states
      this.logger.warn(`Failed to delete object from R2: ${media.key}`);
    }

    const before = media.toObject();

    // Delete from MongoDB
    await media.deleteOne();

    // Log Audit Log
    await this.auditLogsService.log({
      action: r2Deleted ? 'media.deleted' : 'media.delete_failed',
      resource: 'Media',
      resourceId: id,
      before,
      metadata: {
        filename: media.filename,
        key: media.key,
        folder: media.folder,
        ...(r2Error ? { error: r2Error } : {}),
      },
      request: req,
    });
  }

  async previewUnused(olderThanDays = 30, req?: any) {
    const safeOlderThanDays = this.normalizeCleanupDays(olderThanDays);
    const cutoff = new Date(
      Date.now() - safeOlderThanDays * 24 * 60 * 60 * 1000,
    );
    const unused = await this.mediaModel
      .find({
        isUsed: false,
        createdAt: { $lte: cutoff },
      })
      .select('_id filename key url size createdAt')
      .exec();

    const estimatedFreedBytes = unused.reduce(
      (total, item) => total + (item.size ?? 0),
      0,
    );

    await this.auditLogsService.log({
      action: 'media.cleanup.previewed',
      resource: 'Media',
      metadata: {
        total: unused.length,
        olderThanDays: safeOlderThanDays,
        estimatedFreedBytes,
      },
      request: req,
    });

    return {
      total: unused.length,
      items: unused,
      olderThanDays: safeOlderThanDays,
      estimatedFreedBytes,
    };
  }

  async cleanupUnused(olderThanDays = 30, confirm = false, req?: any) {
    if (!confirm) {
      throw new BadRequestException('confirm must be true to cleanup media');
    }

    const preview = await this.previewUnused(olderThanDays);
    let deleted = 0;

    for (const media of preview.items) {
      await this.remove(media._id.toString(), req);
      deleted += 1;
    }

    await this.auditLogsService.log({
      action: 'media.cleanup.executed',
      resource: 'Media',
      metadata: {
        matched: preview.total,
        deleted,
        olderThanDays: preview.olderThanDays,
        estimatedFreedBytes: preview.estimatedFreedBytes,
      },
      request: req,
    });

    return {
      matched: preview.total,
      deleted,
      olderThanDays: preview.olderThanDays,
      estimatedFreedBytes: preview.estimatedFreedBytes,
    };
  }

  /**
   * Automatically synchronizes usage tracking of media files when articles, projects,
   * profiles or links are created, updated, or removed.
   *
   * @param newUrlsOrKeys Array of image/doc URLs or keys currently referenced by the resource-field
   * @param resourceType The target module/model name (e.g. 'Project', 'BlogPost')
   * @param resourceId Mongoose ID of the parent resource
   * @param field Name of the mongoose attribute holding references (e.g. 'coverImage', 'gallery')
   */
  async syncUsage(
    newUrlsOrKeys: string[],
    resourceType: string,
    resourceId: string,
    field: string,
  ): Promise<void> {
    const cleanUrlsOrKeys = [
      ...new Set(
        (newUrlsOrKeys ?? [])
          .map((val) => val?.trim())
          .filter((val): val is string => Boolean(val))
          .filter((val) => this.isInternalMediaReference(val)),
      ),
    ];

    // 1. Fetch current associations
    const currentMedia = await this.mediaModel.find({
      'usedIn.resourceType': resourceType,
      'usedIn.resourceId': resourceId,
      'usedIn.field': field,
    });

    // 2. Fetch media items matched by new URLs or Keys
    const newMedia = await this.mediaModel.find({
      $or: [
        { url: { $in: cleanUrlsOrKeys } },
        { key: { $in: cleanUrlsOrKeys } },
      ],
    });

    const newMediaIds = newMedia.map((m) => m._id.toString());
    const foundReferences = new Set(
      newMedia.flatMap((media) => [media.url, media.key]),
    );

    for (const reference of cleanUrlsOrKeys) {
      if (!foundReferences.has(reference)) {
        this.logger.warn(
          `Media usage reference was not found: ${resourceType}/${resourceId}/${field}`,
        );
      }
    }

    // Remove association from media that are no longer referenced
    for (const media of currentMedia) {
      if (!newMediaIds.includes(media._id.toString())) {
        media.usedIn = media.usedIn.filter(
          (assoc) =>
            !(
              assoc.resourceType === resourceType &&
              assoc.resourceId === resourceId &&
              assoc.field === field
            ),
        );
        media.isUsed = media.usedIn.length > 0;
        await media.save();
      }
    }

    // Add association to newly referenced media
    for (const media of newMedia) {
      const alreadyLinked = media.usedIn.some(
        (assoc) =>
          assoc.resourceType === resourceType &&
          assoc.resourceId === resourceId &&
          assoc.field === field,
      );

      if (!alreadyLinked) {
        media.usedIn.push({
          resourceType,
          resourceId,
          field,
        });
        media.isUsed = true;
        await media.save();
      }
    }
  }

  async removeUsageForEntity(
    resourceType: string,
    resourceId: string,
  ): Promise<void> {
    const currentMedia = await this.mediaModel.find({
      'usedIn.resourceType': resourceType,
      'usedIn.resourceId': resourceId,
    });

    for (const media of currentMedia) {
      media.usedIn = media.usedIn.filter(
        (assoc) =>
          !(
            assoc.resourceType === resourceType &&
            assoc.resourceId === resourceId
          ),
      );
      media.isUsed = media.usedIn.length > 0;
      await media.save();
    }
  }

  async assertMediaExists(
    mediaId: string | Types.ObjectId,
    options?: { type?: 'image' | 'document'; folder?: string | string[] },
  ): Promise<Media> {
    if (!mediaId) {
      throw new BadRequestException('يجب توفير معرّف الملف');
    }
    if (!isValidObjectId(mediaId)) {
      throw new BadRequestException('معرّف الملف غير صالح');
    }
    const media = await this.mediaModel.findById(mediaId);
    if (!media) {
      throw new NotFoundException(
        `الملف ذو المعرّف ${mediaId.toString()} غير موجود`,
      );
    }
    if (options?.type && media.type !== options.type) {
      throw new BadRequestException(
        `نوع الملف غير مطابق للمطلوب. المطلوب: ${options.type}، الحالي: ${media.type}`,
      );
    }
    if (options?.folder) {
      const allowedFolders = Array.isArray(options.folder)
        ? options.folder
        : [options.folder];
      if (!allowedFolders.includes(media.folder)) {
        throw new BadRequestException(
          `المجلد الخاص بالملف غير مطابق. المجلد الحالي: ${media.folder}`,
        );
      }
    }
    return media;
  }

  async assertManyMediaExist(
    mediaIds: Array<string | Types.ObjectId>,
    options?: { type?: 'image' | 'document'; folder?: string | string[] },
  ): Promise<Media[]> {
    if (!mediaIds || !Array.isArray(mediaIds)) {
      return [];
    }
    const uniqueIds = [...new Set(mediaIds.map((id) => id.toString()))];
    const mediaList = await Promise.all(
      uniqueIds.map((id) => this.assertMediaExists(id, options)),
    );
    return mediaList;
  }

  async syncUsageByIds(
    mediaIds: Array<string | Types.ObjectId>,
    resourceType: string,
    resourceId: string,
    field: string,
  ): Promise<void> {
    const cleanIds = [
      ...new Set(
        (mediaIds ?? [])
          .map((val) => val?.toString().trim())
          .filter((val): val is string => isValidObjectId(val)),
      ),
    ];

    // Fetch current associations for this specific resource-field
    const currentMedia = await this.mediaModel.find({
      'usedIn.resourceType': resourceType,
      'usedIn.resourceId': resourceId,
      'usedIn.field': field,
    });

    // Remove association from media that are no longer referenced
    for (const media of currentMedia) {
      if (!cleanIds.includes(media._id.toString())) {
        media.usedIn = media.usedIn.filter(
          (assoc) =>
            !(
              assoc.resourceType === resourceType &&
              assoc.resourceId === resourceId &&
              assoc.field === field
            ),
        );
        media.isUsed = media.usedIn.length > 0;
        await media.save();
      }
    }

    // Add association to newly referenced media
    for (const id of cleanIds) {
      const media = await this.mediaModel.findById(id);
      if (media) {
        const alreadyLinked = media.usedIn.some(
          (assoc) =>
            assoc.resourceType === resourceType &&
            assoc.resourceId === resourceId &&
            assoc.field === field,
        );

        if (!alreadyLinked) {
          media.usedIn.push({
            resourceType,
            resourceId,
            field,
          });
          media.isUsed = true;
          await media.save();
        }
      } else {
        this.logger.warn(
          `Media reference ${id} not found when syncing usage for ${resourceType}/${resourceId}/${field}`,
        );
      }
    }
  }

  async resolveMediaUrl(
    mediaId?: string | Types.ObjectId,
  ): Promise<string | undefined> {
    if (!mediaId || !isValidObjectId(mediaId)) {
      return undefined;
    }
    const media = await this.mediaModel.findById(mediaId);
    return media?.url;
  }

  async resolveManyMediaUrls(
    mediaIds?: Array<string | Types.ObjectId>,
  ): Promise<string[]> {
    if (!mediaIds || !Array.isArray(mediaIds)) {
      return [];
    }
    const urls: string[] = [];
    for (const id of mediaIds) {
      const url = await this.resolveMediaUrl(id);
      if (url) {
        urls.push(url);
      }
    }
    return urls;
  }

  async resolveMediaObject(
    mediaId?: string | Types.ObjectId,
  ): Promise<ResolvedMedia | undefined> {
    if (!mediaId || !isValidObjectId(mediaId)) {
      return undefined;
    }
    const media = await this.mediaModel.findById(mediaId);
    if (!media) {
      return undefined;
    }
    return {
      id: media._id.toString(),
      key: media.key,
      url: media.url,
      alt: media.alt || '',
      type: media.type,
      folder: media.folder,
      mimeType: media.mimeType,
      width: media.width,
      height: media.height,
    };
  }

  async resolveMediaObjectsByIds(
    mediaIds?: Array<string | Types.ObjectId | null | undefined>,
  ): Promise<Map<string, ResolvedMedia>> {
    const ids = [
      ...new Set(
        (mediaIds ?? [])
          .filter((id): id is string | Types.ObjectId => Boolean(id))
          .map((id) => id.toString())
          .filter((id) => isValidObjectId(id)),
      ),
    ];
    if (!ids.length) return new Map();

    const mediaList = await this.mediaModel.find({ _id: { $in: ids } }).lean();
    return new Map(
      mediaList.map((media) => [
        media._id.toString(),
        {
          id: media._id.toString(),
          key: media.key,
          url: media.url,
          alt: media.alt || '',
          type: media.type,
          folder: media.folder,
          mimeType: media.mimeType,
          width: media.width,
          height: media.height,
        },
      ]),
    );
  }

  async findIdsByUrls(urls: string[]): Promise<string[]> {
    const uniqueUrls = [...new Set(urls.filter(Boolean))];
    if (!uniqueUrls.length) return [];
    const media = await this.mediaModel
      .find({ url: { $in: uniqueUrls } })
      .select('_id')
      .lean();
    return media.map((item) => item._id.toString());
  }

  async resolveManyMediaObjects(
    mediaIds?: Array<string | Types.ObjectId>,
  ): Promise<ResolvedMedia[]> {
    if (!mediaIds || !Array.isArray(mediaIds)) {
      return [];
    }
    const objects: ResolvedMedia[] = [];
    for (const id of mediaIds) {
      const obj = await this.resolveMediaObject(id);
      if (obj) {
        objects.push(obj);
      }
    }
    return objects;
  }

  extractMediaUrlsFromContent(content: string): string[] {
    const urls = new Set<string>();
    const markdownImageRegex = /!\[[^\]]*]\((?<url>[^)\s]+)(?:\s+"[^"]*")?\)/g;
    const htmlImageRegex = /<img\b[^>]*\bsrc=["'](?<url>[^"']+)["'][^>]*>/gi;

    for (const match of content.matchAll(markdownImageRegex)) {
      if (match.groups?.url) {
        urls.add(match.groups.url);
      }
    }

    for (const match of content.matchAll(htmlImageRegex)) {
      if (match.groups?.url) {
        urls.add(match.groups.url);
      }
    }

    return [...urls];
  }

  async checkStorageHealth(): Promise<{
    status: 'ok' | 'error' | 'disabled';
    message?: string;
    latencyMs?: number;
  }> {
    if (!this.s3 || !this.bucket) {
      return { status: 'disabled', message: 'Storage is not configured' };
    }

    const startedAt = Date.now();
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return { status: 'ok', latencyMs: Date.now() - startedAt };
    } catch {
      return {
        status: 'error',
        message: 'Storage health check failed',
        latencyMs: Date.now() - startedAt,
      };
    }
  }

  private getStorageClient(): S3Client {
    if (!this.s3 || !this.bucket) {
      throw new BadRequestException('Cloudflare R2 storage is not configured');
    }

    return this.s3;
  }

  private isStorageConfigured(
    accessKeyId: string,
    secretAccessKey: string,
    endpoint: string,
  ): boolean {
    return Boolean(this.bucket && accessKeyId && secretAccessKey && endpoint);
  }

  private isInternalMediaReference(reference: string): boolean {
    if (!reference) {
      return false;
    }

    if (/^https?:\/\//i.test(reference)) {
      return Boolean(
        this.publicUrl && reference.startsWith(`${this.publicUrl}/`),
      );
    }

    return !reference.startsWith('//');
  }

  private normalizeCleanupDays(olderThanDays: number): number {
    if (!Number.isInteger(olderThanDays) || olderThanDays < 7) {
      throw new BadRequestException('olderThanDays must be at least 7');
    }

    return olderThanDays;
  }

  private getRequestUserId(req?: RequestWithOptionalUser): string | undefined {
    return req?.user?.userId || req?.user?.id || req?.user?._id;
  }
}
