import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostsService } from './posts.service';

@Injectable()
export class PostsScheduler {
  private readonly logger = new Logger(PostsScheduler.name);

  constructor(private readonly postsService: PostsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async publishDuePosts() {
    const result = await this.postsService.publishDueScheduledPosts();
    if (result.modified > 0) {
      this.logger.log(`Auto-published ${result.modified} scheduled posts`);
    }
  }
}
