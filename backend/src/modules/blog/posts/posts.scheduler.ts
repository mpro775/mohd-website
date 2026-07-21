import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostWorkflowService } from './post-workflow.service';

@Injectable()
export class PostsScheduler {
  private readonly logger = new Logger(PostsScheduler.name);

  constructor(private readonly workflow: PostWorkflowService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async publishDuePosts() {
    const startedAt = Date.now();
    this.logger.log(JSON.stringify({ event: 'blog.scheduler.started' }));
    const result = await this.workflow.publishDueScheduledPosts();
    this.logger.log(
      JSON.stringify({
        event: 'blog.scheduler.completed',
        ...result,
        durationMs: Date.now() - startedAt,
      }),
    );
    return result;
  }
}
