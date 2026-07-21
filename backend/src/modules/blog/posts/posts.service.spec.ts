import { PostWorkflowService } from './post-workflow.service';
import { PostStatus } from './schemas/post.schema';

describe('scheduled publishing', () => {
  it('claims a due post atomically and is idempotent across runs', async () => {
    const candidate = {
      _id: '507f1f77bcf86cd799439011',
      version: 3,
      author: { toString: () => '507f1f77bcf86cd799439012' },
    };
    const dueQuery = {
      select: jest
        .fn()
        .mockReturnValue({ lean: jest.fn().mockResolvedValue([candidate]) }),
    };
    const updated = {
      ...candidate,
      slug: 'scheduled-post',
      status: PostStatus.PUBLISHED,
      version: 4,
    };
    const postModel = {
      find: jest.fn().mockReturnValue(dueQuery),
      findOneAndUpdate: jest
        .fn()
        .mockResolvedValueOnce(updated)
        .mockResolvedValueOnce(null),
    };
    const revisions = { create: jest.fn().mockResolvedValue({}) };
    const revalidation = {
      revalidate: jest.fn(),
      tagsForPost: jest.fn().mockReturnValue(['blog']),
    };
    const audit = { log: jest.fn() };
    const service = new PostWorkflowService(
      postModel as any,
      {} as any,
      revisions as any,
      revalidation as any,
      audit as any,
    );

    const first = await service.publishDueScheduledPosts(
      new Date('2026-01-01T00:01:00Z'),
    );
    const second = await service.publishDueScheduledPosts(
      new Date('2026-01-01T00:01:00Z'),
    );

    expect(postModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: PostStatus.SCHEDULED,
        scheduledAt: expect.any(Object),
      }),
      expect.objectContaining({
        $set: expect.objectContaining({ status: PostStatus.PUBLISHED }),
        $unset: { scheduledAt: 1 },
      }),
      { new: true },
    );
    expect(first.published).toBe(1);
    expect(second.published).toBe(0);
    expect(revisions.create).toHaveBeenCalledTimes(1);
  });
});
