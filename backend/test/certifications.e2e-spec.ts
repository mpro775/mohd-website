import {
  CanActivate,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import request from 'supertest';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../src/common/guards/permissions.guard';
import { CertificationType } from '../src/common/taxonomy/credential-taxonomy';
import {
  AdminCertificationsController,
  PublicCertificationsController,
} from '../src/modules/certifications/certifications.controller';
import { CertificationsService } from '../src/modules/certifications/certifications.service';
import { MediaService } from '../src/modules/media/media.service';

const id = new Types.ObjectId();
const item = {
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
  createdAt: new Date(),
  updatedAt: new Date(),
};

const media = {
  resolveMediaObjectsByIds: jest.fn().mockResolvedValue(new Map()),
};

describe('Certifications controllers (e2e)', () => {
  async function publicApp(service: Record<string, unknown>) {
    const module = await Test.createTestingModule({
      controllers: [PublicCertificationsController],
      providers: [
        { provide: CertificationsService, useValue: service },
        { provide: MediaService, useValue: media },
      ],
    }).compile();
    const app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
    return app;
  }

  async function adminApp(jwt: CanActivate, roles: CanActivate) {
    const service = {
      create: jest.fn().mockResolvedValue(item),
      findAllAdmin: jest.fn().mockResolvedValue({ data: [item], meta: {} }),
    };
    const builder = Test.createTestingModule({
      controllers: [AdminCertificationsController],
      providers: [
        { provide: CertificationsService, useValue: service },
        { provide: MediaService, useValue: media },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(jwt)
      .overrideGuard(PermissionsGuard)
      .useValue(roles);
    const module = await builder.compile();
    const app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    return { app, service };
  }

  it('returns only the public service result with pagination', async () => {
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
    };
    const app = await publicApp(service);
    await request(app.getHttpServer())
      .get('/api/public/certifications')
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toHaveLength(1);
        expect(body.data[0].isPublished).toBeUndefined();
        expect(body.meta.total).toBe(1);
      });
    await app.close();
  });

  it('returns 401 without a valid admin identity', async () => {
    const jwt = {
      canActivate: () => {
        throw new UnauthorizedException();
      },
    };
    const { app } = await adminApp(jwt, { canActivate: () => true });
    await request(app.getHttpServer())
      .get('/api/admin/certifications')
      .expect(401);
    await app.close();
  });

  it('returns 403 without an allowed role', async () => {
    const { app } = await adminApp(
      { canActivate: () => true },
      { canActivate: () => false },
    );
    await request(app.getHttpServer())
      .get('/api/admin/certifications')
      .expect(403);
    await app.close();
  });

  it('validates URLs and creates valid records', async () => {
    const { app, service } = await adminApp(
      { canActivate: () => true },
      { canActivate: () => true },
    );
    await request(app.getHttpServer())
      .post('/api/admin/certifications')
      .send({
        title: 'AWS Certificate',
        type: 'course',
        issuer: 'AWS',
        credentialUrl: 'invalid',
      })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/admin/certifications')
      .send({
        title: 'AWS Certificate',
        type: 'course',
        issuer: 'AWS',
        credentialUrl: 'https://example.com',
      })
      .expect(201);
    expect(service.create).toHaveBeenCalledTimes(1);
    await app.close();
  });
});
