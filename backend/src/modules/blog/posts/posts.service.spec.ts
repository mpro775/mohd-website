import { PostsService } from './posts.service';
import { PostStatus } from './schemas/post.schema';

describe('PostsService', () => {
  it('publishes due scheduled posts idempotently', async () => {
    const duePost = {
      _id: 'post-id',
      publishDate: new Date('2026-01-01T00:00:00.000Z'),
      scheduledAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    const postModel = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([duePost]),
        }),
      }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    const service = new PostsService(
      postModel as any,
      {} as any,
      {} as any,
      {} as any,
      { log: jest.fn() } as any,
    );

    const result = await service.publishDueScheduledPosts(
      new Date('2026-01-01T00:01:00.000Z'),
    );

    expect(postModel.updateOne).toHaveBeenCalledWith(
      { _id: 'post-id', status: PostStatus.SCHEDULED },
      expect.objectContaining({ status: PostStatus.PUBLISHED }),
    );
    expect(result).toEqual({ matched: 1, modified: 1 });
  });
});
