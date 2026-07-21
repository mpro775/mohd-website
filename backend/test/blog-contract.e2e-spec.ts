import {
  Body,
  Controller,
  INestApplication,
  Post as HttpPost,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CreatePostDraftDto } from '../src/modules/blog/posts/dto/create-post.dto';

@Controller('posts')
class ContractController {
  @HttpPost()
  create(@Body() dto: CreatePostDraftDto) {
    return dto;
  }
}

describe('Blog content contract (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ContractController],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });
  afterAll(() => app.close());

  const body = {
    title: 'Technical post',
    summary: 'A sufficiently long summary for the draft contract.',
    content:
      '```tsx\n<div className="card">Hello</div>\n```\n\nArray<T> and x < y',
    category: '507f1f77bcf86cd799439011',
  };

  it('rejects workflow status from create DTO', () =>
    request(app.getHttpServer())
      .post('/posts')
      .send({ ...body, status: 'published' })
      .expect(400));

  it('round-trips technical markdown without corruption', () =>
    request(app.getHttpServer())
      .post('/posts')
      .send(body)
      .expect(201)
      .expect(({ body: response }) => {
        expect(response.content).toBe(body.content);
        expect(response.content).toContain('Array<T>');
      }));
});
