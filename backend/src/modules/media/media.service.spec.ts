import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { MediaService } from './media.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Media } from './schemas/media.schema';
import { MediaFolder, UploadMediaDto } from './dto/upload-media.dto';

describe('MediaService validation', () => {
  it('rejects unsupported file types before uploading', async () => {
    const mockConfig = {
      get: jest.fn().mockImplementation((path: string) => {
        if (path === 'cloudflare.r2.bucket') return 'test';
        if (path === 'cloudflare.r2.publicUrl') return 'http://test';
        if (path === 'cloudflare.r2.endpoint') return 'http://endpoint';
        if (path === 'cloudflare.r2.accessKeyId') return 'test';
        if (path === 'cloudflare.r2.secretAccessKey') return 'test';
        return '';
      }),
    } as unknown as ConfigService;

    const mockAudit = {
      log: jest.fn(),
    } as unknown as AuditLogsService;

    const mockModel = {} as unknown as Model<Media>;

    const service = new MediaService(mockConfig, mockAudit, mockModel);

    const file = {
      mimetype: 'application/x-msdownload',
      size: 100,
      buffer: Buffer.from('bad'),
      originalname: 'bad.exe',
    } as Express.Multer.File;

    const dto = {
      folder: MediaFolder.MISC,
    } as UploadMediaDto;

    await expect(service.upload(file, dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
