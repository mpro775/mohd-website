import { BadRequestException } from '@nestjs/common';
import { MediaService } from './media.service';

describe('MediaService validation', () => {
  it('rejects unsupported file types before uploading', async () => {
    const service = new MediaService(
      { get: jest.fn().mockReturnValue('test') } as any,
      { create: jest.fn() } as any,
    );

    await expect(
      service.upload({
        mimetype: 'application/x-msdownload',
        size: 100,
        buffer: Buffer.from('bad'),
        originalname: 'bad.exe',
      } as Express.Multer.File),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
