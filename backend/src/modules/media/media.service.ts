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
import { Model } from 'mongoose';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { Media } from './schemas/media.schema';

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DOCUMENT_MIME_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Media.name) private readonly mediaModel: Model<Media>,
  ) {
    this.bucket = this.configService.get<string>('cloudflare.r2.bucket') ?? '';
    this.publicUrl = (
      this.configService.get<string>('cloudflare.r2.publicUrl') ?? ''
    ).replace(/\/$/, '');
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('cloudflare.r2.endpoint') ?? '',
      credentials: {
        accessKeyId:
          this.configService.get<string>('cloudflare.r2.accessKeyId') ?? '',
        secretAccessKey:
          this.configService.get<string>('cloudflare.r2.secretAccessKey') ?? '',
      },
    });
  }

  async upload(file: Express.Multer.File): Promise<Media> {
    if (!file) throw new BadRequestException('File is required');
    if (file.size > MAX_FILE_SIZE)
      throw new BadRequestException('File size exceeds 10MB');

    const isImage = IMAGE_MIME_TYPES.includes(file.mimetype);
    const isDocument = DOCUMENT_MIME_TYPES.includes(file.mimetype);
    if (!isImage && !isDocument) {
      throw new BadRequestException('Only images and PDF files are allowed');
    }

    let body = file.buffer;
    let mimeType = file.mimetype;
    let width: number | undefined;
    let height: number | undefined;
    let extension = extname(file.originalname).toLowerCase();

    if (isImage && file.mimetype !== 'image/gif') {
      const image = sharp(file.buffer).rotate();
      const metadata = await image.metadata();
      width = metadata.width;
      height = metadata.height;
      body = await image.webp({ quality: 82 }).toBuffer();
      mimeType = 'image/webp';
      extension = '.webp';
    }

    const type = isImage ? 'image' : 'document';
    const key = `${type}s/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: mimeType,
      }),
    );

    return this.mediaModel.create({
      key,
      url: `${this.publicUrl}/${key}`,
      originalName: file.originalname,
      mimeType,
      size: body.length,
      type,
      width,
      height,
    });
  }

  async findAll(): Promise<Media[]> {
    return this.mediaModel.find().sort({ createdAt: -1 });
  }

  async remove(id: string): Promise<void> {
    const media = await this.mediaModel.findById(id);
    if (!media) throw new NotFoundException('Media not found');

    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: media.key }),
    );
    await media.deleteOne();
  }
}
