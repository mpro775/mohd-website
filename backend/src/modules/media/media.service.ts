import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeleteObjectCommand,
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

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOC_MIMES = ['application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit enforced

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
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
      this.configService.get<string>('cloudflare.r2.region') ?? 'auto';

    if (!this.bucket || !accessKeyId || !secretAccessKey || !endpoint) {
      throw new Error(
        'Cloudflare R2 environment settings are missing or incomplete. Cannot boot MediaService.',
      );
    }

    this.s3 = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async upload(
    file: Express.Multer.File,
    dto: UploadMediaDto,
    req?: any,
  ): Promise<Media> {
    if (!file) {
      throw new BadRequestException('يجب توفير الملف المراد رفعه');
    }
    if (!dto || !dto.folder) {
      throw new BadRequestException('يجب تحديد مجلد الرفع');
    }

    // 1. Enforce size limits (5MB)
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        'حجم الملف يتجاوز الحد الأقصى المسموح به وهو 5 ميجابايت',
      );
    }

    const isImage = ALLOWED_IMAGE_MIMES.includes(file.mimetype);
    const isPdf = ALLOWED_DOC_MIMES.includes(file.mimetype);

    if (!isImage && !isPdf) {
      throw new BadRequestException(
        'نوع الملف غير مدعوم. الأنواع المسموحة هي: jpeg, png, webp, pdf',
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
        // Enforce Sharp validation & exif auto-rotation
        const image = sharp(file.buffer).rotate();
        const metadata = await image.metadata();

        const allowedSharpFormats = ['jpeg', 'png', 'webp'];
        if (
          !metadata.format ||
          !allowedSharpFormats.includes(metadata.format)
        ) {
          throw new BadRequestException('محتوى الصورة غير صالح أو غير مدعوم');
        }

        // Convert JPEG/PNG to WebP format
        if (metadata.format !== 'webp') {
          fileBuffer = await image.webp({ quality: 82 }).toBuffer();
          finalMimeType = 'image/webp';
          extension = '.webp';
        } else {
          // It is webp, optimize/save it
          fileBuffer = await image.webp({ quality: 82 }).toBuffer();
          finalMimeType = 'image/webp';
          extension = '.webp';
        }

        width = metadata.width;
        height = metadata.height;
      } catch {
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
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: finalMimeType,
      }),
    );

    const userId = req?.user?.userId || req?.user?.id || req?.user?._id;

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
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
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
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: media.key,
        }),
      );
    } catch (e) {
      r2Deleted = false;
      r2Error = e.message || e;
      // Log warning but proceed with MongoDB removal if R2 deletes fail to avoid dangling DB states
      console.warn(`Failed to delete object from R2: ${media.key}`, e);
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
    const cleanUrlsOrKeys = (newUrlsOrKeys ?? []).filter((val) => !!val);

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
}
