import { SeoService } from './seo.service';
import { PostStatus } from '../blog/posts/schemas/post.schema';

describe('SeoService entries', () => {
  it('requests only published, indexable, non-deleted posts', async () => {
    const entries = [
      {
        type: 'post',
        path: '/blog/post',
        title: 'Post',
        description: 'Summary',
        publishedAt: new Date(),
        lastModified: new Date(),
      },
    ];
    const postModel = {
      aggregate: jest
        .fn()
        .mockResolvedValue([{ data: entries, count: [{ total: 1 }] }]),
    };
    const categoryModel = {};
    const tagModel = {};
    const service = new SeoService(
      postModel as any,
      categoryModel as any,
      tagModel as any,
    );

    const result = await service.getEntries(1, 100);

    const pipeline = postModel.aggregate.mock.calls[0][0];
    expect(pipeline[0]).toEqual({
      $match: expect.objectContaining({
        status: PostStatus.PUBLISHED,
        publishedAt: { $lte: expect.any(Date) },
        allowIndexing: { $ne: false },
        deletedAt: { $exists: false },
      }),
    });
    expect(result.data[0]).toEqual(
      expect.objectContaining({ type: 'post', path: '/blog/post' }),
    );
  });
});
