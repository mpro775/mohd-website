import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { EducationDegreeType } from '../../common/taxonomy/credential-taxonomy';
import { EducationBulkAction } from './dto/bulk-education-action.dto';
import { EducationService } from './education.service';

const id = new Types.ObjectId();
const document = (overrides: Record<string, unknown> = {}) => ({
  _id: id,
  institution: 'Example University',
  slug: 'bachelor-computer-science-example-university',
  degree: 'Bachelor',
  degreeType: EducationDegreeType.BACHELOR,
  isCurrent: false,
  achievements: [],
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
    service: new EducationService(
      model as never,
      media as never,
      audit as never,
    ),
    model,
    media,
    audit,
  };
}

describe('EducationService', () => {
  it('creates education with a composite slug, cleaned achievements and media synchronization', async () => {
    const { service, media, audit } = setup();
    const result = await service.create({
      institution: 'Example University',
      degree: 'Bachelor',
      degreeType: EducationDegreeType.BACHELOR,
      fieldOfStudy: 'Computer Science',
      achievements: ['Dean List', ' dean list '],
      institutionLogoMediaId: id.toString(),
    });
    expect(result.slug).toBe('bachelor-computer-science-example-university');
    expect(result.achievements).toEqual(['Dean List']);
    expect(media.assertMediaExists).toHaveBeenCalledWith(id.toString(), {
      type: 'image',
    });
    expect(media.syncUsageByIds).toHaveBeenCalledTimes(4);
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'education.created' }),
    );
  });

  it('clears the end date when the education is current', async () => {
    const { service } = setup();
    const result = await service.create({
      institution: 'Example University',
      degree: 'Master',
      degreeType: EducationDegreeType.MASTER,
      startDate: '2025-01-01',
      endDate: '2026-01-01',
      isCurrent: true,
    });
    expect(result.endDate).toBeUndefined();
  });

  it('rejects an end date before the start date', async () => {
    const { service } = setup();
    await expect(
      service.create({
        institution: 'Example University',
        degree: 'Bachelor',
        degreeType: EducationDegreeType.BACHELOR,
        startDate: '2024-01-01',
        endDate: '2023-01-01',
        isCurrent: false,
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
        institution: 'Example University',
        degree: 'Bachelor',
        degreeType: EducationDegreeType.BACHELOR,
        coverImageMediaId: id.toString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('hides drafts and applies education filters in public lists', async () => {
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
    await service.findAllPublic({
      degreeType: EducationDegreeType.BACHELOR,
      institution: 'Example',
      isCurrent: false,
      startYear: 2019,
      endYear: 2023,
    });
    expect(model.find).toHaveBeenCalledWith(
      expect.objectContaining({
        isPublished: true,
        degreeType: EducationDegreeType.BACHELOR,
        isCurrent: false,
        startDate: expect.any(Object),
        endDate: expect.any(Object),
      }),
    );
  });

  it('refuses partial reorder', async () => {
    const { service, model } = setup();
    model.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });
    await expect(
      service.reorder({ items: [{ id: id.toString(), order: 0 }] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('applies and audits bulk feature', async () => {
    const { service, model, audit } = setup();
    model.updateMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
    });
    const result = await service.bulkAction({
      action: EducationBulkAction.FEATURE,
      ids: [id.toString()],
    });
    expect(result.modifiedCount).toBe(1);
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'education.bulk_featured' }),
    );
  });
});
