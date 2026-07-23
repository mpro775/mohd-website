import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import sharp from 'sharp';
import { MediaService } from './media.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Media } from './schemas/media.schema';
import { MediaFolder, UploadMediaDto } from './dto/upload-media.dto';

describe('MediaService validation and image processing', () => {
  let service: MediaService;
  let send: jest.Mock;
  let create: jest.Mock;

  const dto = { folder: MediaFolder.MISC } as UploadMediaDto;

  beforeEach(() => {
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

    create = jest
      .fn()
      .mockImplementation(async (value: Record<string, any>) => ({
        ...value,
        _id: { toString: () => 'media-id' },
        toObject: () => value,
      }));
    const mockModel = { create } as unknown as Model<Media>;

    service = new MediaService(mockConfig, mockAudit, mockModel);
    send = jest.fn().mockResolvedValue({});
    Object.defineProperty(service, 's3', { value: { send } });
  });

  function file(
    buffer: Buffer,
    mimetype: string,
    originalname: string,
    size = buffer.length,
  ) {
    return { buffer, mimetype, originalname, size } as Express.Multer.File;
  }

  async function animatedBuffer(format: 'gif' | 'webp') {
    const redFrame = Buffer.from([
      255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    ]);
    const blueFrame = Buffer.from([
      0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    ]);
    const image = sharp(Buffer.concat([redFrame, blueFrame]), {
      raw: { width: 2, height: 4, channels: 4, pageHeight: 2 },
    });
    return format === 'gif'
      ? image.gif({ delay: [100, 100], loop: 0 }).toBuffer()
      : image.webp({ delay: [100, 100], loop: 0 }).toBuffer();
  }

  it('rejects unsupported file types before uploading', async () => {
    await expect(
      service.upload(
        file(Buffer.from('bad'), 'application/x-msdownload', 'bad.exe'),
        dto,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(send).not.toHaveBeenCalled();
  });

  it.each(['gif', 'webp'] as const)(
    'preserves animated %s bytes, MIME type and frame dimensions',
    async (format) => {
      const buffer = await animatedBuffer(format);
      const result = await service.upload(
        file(buffer, `image/${format}`, `demo.${format}`),
        dto,
      );

      const command = send.mock.calls[0][0];
      expect(command.input.Body).toEqual(buffer);
      expect(command.input.ContentType).toBe(`image/${format}`);
      expect(result.mimeType).toBe(`image/${format}`);
      expect(result.width).toBe(2);
      expect(result.height).toBe(2);
    },
  );

  it('converts a static PNG to optimized WebP', async () => {
    const buffer = await sharp({
      create: { width: 3, height: 2, channels: 4, background: '#ff0000' },
    })
      .png()
      .toBuffer();

    const result = await service.upload(
      file(buffer, 'image/png', 'still.png'),
      dto,
    );

    const command = send.mock.calls[0][0];
    expect(command.input.ContentType).toBe('image/webp');
    expect(result.filename).toBe('still.webp');
    expect(result.width).toBe(3);
    expect(result.height).toBe(2);
  });

  it('applies the 5MB limit to static WebP after inspecting its frames', async () => {
    const buffer = await sharp({
      create: { width: 1, height: 1, channels: 4, background: '#000000' },
    })
      .webp()
      .toBuffer();

    await expect(
      service.upload(
        file(buffer, 'image/webp', 'large.webp', 5 * 1024 * 1024 + 1),
        dto,
      ),
    ).rejects.toThrow('حجم الصورة الثابتة');
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects a file whose declared image MIME does not match its content', async () => {
    const gif = await animatedBuffer('gif');
    await expect(
      service.upload(file(gif, 'image/png', 'spoofed.png'), dto),
    ).rejects.toThrow('محتوى الصورة غير صالح');
    expect(create).not.toHaveBeenCalled();
  });
});
