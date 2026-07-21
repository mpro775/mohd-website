import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import request from 'supertest';
import { EducationDegreeType } from '../src/common/taxonomy/credential-taxonomy';
import { PublicEducationController } from '../src/modules/education/education.controller';
import { EducationService } from '../src/modules/education/education.service';
import { MediaService } from '../src/modules/media/media.service';

const item = {
  _id: new Types.ObjectId(),
  institution: 'Example University',
  slug: 'bachelor-example-university',
  degree: 'Bachelor',
  degreeType: EducationDegreeType.BACHELOR,
  isCurrent: false,
  achievements: [],
  isPublished: true,
  isFeatured: false,
  order: 0,
  seo: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Education public controller (e2e)', () => {
  let app: INestApplication;
  const service = {
    findAllPublic: jest.fn().mockResolvedValue({
      data: [item],
      meta: {
        total: 1,
        page: 1,
        limit: 12,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }),
    findOnePublic: jest.fn((slug: string) =>
      slug === item.slug
        ? Promise.resolve(item)
        : Promise.reject(new NotFoundException()),
    ),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [PublicEducationController],
      providers: [
        { provide: EducationService, useValue: service },
        {
          provide: MediaService,
          useValue: {
            resolveMediaObjectsByIds: () => Promise.resolve(new Map()),
          },
        },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => app.close());

  it('lists published education with pagination', async () => {
    await request(app.getHttpServer())
      .get('/api/public/education')
      .expect(200)
      .expect(({ body }) => {
        expect(body.data[0].institution).toBe('Example University');
        expect(body.meta.total).toBe(1);
      });
  });

  it('returns a published detail and hides unknown/draft slugs as 404', async () => {
    await request(app.getHttpServer())
      .get(`/api/public/education/${item.slug}`)
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/public/education/draft-item')
      .expect(404);
  });
});
