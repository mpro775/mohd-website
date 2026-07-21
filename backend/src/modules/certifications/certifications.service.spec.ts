import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CertificationType } from '../../common/taxonomy/credential-taxonomy';
import { CertificationBulkAction } from './dto/bulk-certification-action.dto';
import { CertificationsService } from './certifications.service';

const id = new Types.ObjectId();
const document = (overrides: Record<string, unknown> = {}) => ({
  _id: id,
  title: 'AWS Certificate',
  slug: 'aws-certificate',
  type: CertificationType.COURSE,
  issuer: 'AWS',
  doesNotExpire: true,
  skills: [],
  isPublished: true,
  isFeatured: false,
  order: 0,
  seo: {},
  toObject() {
    return { ...this };
  },
  ...overrides,
});

function setup() {
  const saved = document();
  const model = Object.assign(
    jest.fn().mockImplementation((payload: Record<string, unknown>) => ({
      ...saved,
      ...payload,
      save: jest.fn().mockResolvedValue({ ...saved, ...payload }),
    })),
    {
      exists: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
      bulkWrite: jest.fn(),
    },
  );
  const media = {
    assertMediaExists: jest.fn().mockResolvedValue({}),
    syncUsageByIds: jest.fn().mockResolvedValue(undefined),
    removeUsageForEntity: jest.fn().mockResolvedValue(undefined),
  };
  const audit = { log: jest.fn().mockResolvedValue(undefined) };
  return {
    service: new CertificationsService(
      model as never,
      media as never,
      audit as never,
    ),
    model,
    media,
    audit,
  };
}

describe('CertificationsService', () => {
  it('creates a certification, normalizes the slug and skills, syncs media and audits', async () => {
    const { service, media, audit } = setup();
    const result = await service.create({
      title: ' AWS Certificate ',
      type: CertificationType.COURSE,
      issuer: ' AWS ',
      imageMediaId: id.toString(),
      skills: ['AWS', ' aws ', ''],
      doesNotExpire: true,
    });
    expect(result.slug).toBe('aws-certificate');
    expect(result.skills).toEqual(['AWS']);
    expect(media.assertMediaExists).toHaveBeenCalledWith(id.toString(), {
      type: 'image',
    });
    expect(media.syncUsageByIds).toHaveBeenCalledTimes(4);
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'certification.created' }),
    );
  });

  it('rejects duplicate slugs', async () => {
    const { service, model } = setup();
    model.exists.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: id }),
    });
    await expect(
      service.create({
        title: 'AWS',
        type: CertificationType.COURSE,
        issuer: 'AWS',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects an expiry before issue date', async () => {
    const { service } = setup();
    await expect(
      service.create({
        title: 'AWS',
        type: CertificationType.COURSE,
        issuer: 'AWS',
        issuedAt: '2026-02-01',
        expiresAt: '2026-01-01',
        doesNotExpire: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns a bad request when a referenced media item does not exist', async () => {
    const { service, media } = setup();
    media.assertMediaExists.mockRejectedValueOnce(
      new NotFoundException('الملف غير موجود'),
    );
    await expect(
      service.create({
        title: 'AWS',
        type: CertificationType.COURSE,
        issuer: 'AWS',
        imageMediaId: id.toString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('forces published visibility and safe filters for public lists', async () => {
    const { service, model } = setup();
    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([document()]),
    };
    model.find.mockReturnValue(chain);
    model.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });
    const result = await service.findAllPublic({
      page: 1,
      limit: 12,
      search: 'AWS',
      type: CertificationType.COURSE,
      platform: 'Coursera',
      issuer: 'AWS',
      year: 2026,
    });
    expect(model.find).toHaveBeenCalledWith(
      expect.objectContaining({
        isPublished: true,
        type: CertificationType.COURSE,
        issuedAt: expect.any(Object),
        $or: expect.any(Array),
      }),
    );
    expect(result.meta.total).toBe(1);
  });

  it('refuses partial reorder when an id is missing', async () => {
    const { service, model } = setup();
    model.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });
    await expect(
      service.reorder({ items: [{ id: id.toString(), order: 1 }] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(model.bulkWrite).not.toHaveBeenCalled();
  });

  it('applies and audits bulk publish', async () => {
    const { service, model, audit } = setup();
    model.updateMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
    });
    const result = await service.bulkAction({
      action: CertificationBulkAction.PUBLISH,
      ids: [id.toString()],
    });
    expect(result).toEqual({
      matchedCount: 1,
      modifiedCount: 1,
      deletedCount: 0,
    });
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'certification.bulk_published' }),
    );
  });
});
