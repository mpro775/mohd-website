import { SeoService } from './seo.service';
import { PostStatus } from '../blog/posts/schemas/post.schema';

function findChain(value: any[]) {
  const chain: any = { select: jest.fn(), sort: jest.fn(), lean: jest.fn() };
  chain.select.mockReturnValue(chain);
  chain.sort.mockReturnValue(chain);
  chain.lean.mockResolvedValue(value);
  return chain;
}

describe('SeoService entries', () => {
  it('requests only published, indexable, non-deleted posts', async () => {
    const posts = findChain([
      {
        _id: 'p1',
        slug: 'post',
        title: 'Post',
        summary: 'Summary',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const categories = findChain([]);
    const tags = findChain([]);
    const postModel = {
      find: jest.fn().mockReturnValue(posts),
      aggregate: jest.fn().mockResolvedValue([]),
    };
    const categoryModel = { find: jest.fn().mockReturnValue(categories) };
    const tagModel = { find: jest.fn().mockReturnValue(tags) };
    const service = new SeoService(
      postModel as any,
      categoryModel as any,
      tagModel as any,
    );

    const result = await service.getEntries(1, 100);

    expect(postModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: PostStatus.PUBLISHED,
        allowIndexing: { $ne: false },
        deletedAt: { $exists: false },
      }),
    );
    expect(result.data[0]).toEqual(
      expect.objectContaining({ type: 'post', path: '/blog/post' }),
    );
  });
});
