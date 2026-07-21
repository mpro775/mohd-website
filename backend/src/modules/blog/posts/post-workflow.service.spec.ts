import { PostWorkflowService, POST_TRANSITIONS } from './post-workflow.service';
import { PostStatus } from './schemas/post.schema';

describe('Post workflow state machine', () => {
  const service = Object.create(
    PostWorkflowService.prototype,
  ) as PostWorkflowService;

  it('allows only declared transitions', () => {
    for (const [from, targets] of Object.entries(POST_TRANSITIONS)) {
      for (const target of targets) {
        expect(service.isTransitionAllowed(from as PostStatus, target)).toBe(
          true,
        );
      }
    }
    expect(
      service.isTransitionAllowed(PostStatus.ARCHIVED, PostStatus.PUBLISHED),
    ).toBe(false);
    expect(
      service.isTransitionAllowed(PostStatus.PUBLISHED, PostStatus.IN_REVIEW),
    ).toBe(false);
  });
});
