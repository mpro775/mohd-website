import { Injectable } from '@nestjs/common';
import { CreatePostDraftDto } from './dto/create-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';
import { UpdatePostContentDto } from './dto/update-post.dto';
import { PostsCommandService } from './posts-command.service';
import { PostsQueryService } from './posts-query.service';
import { PostWorkflowService } from './post-workflow.service';

/**
 * Backwards-compatible facade. New code should inject the focused query,
 * command, or workflow service directly.
 */
@Injectable()
export class PostsService {
  constructor(
    private readonly queries: PostsQueryService,
    private readonly commands: PostsCommandService,
    private readonly workflow: PostWorkflowService,
  ) {}

  findAllPublic(filter: FilterPostDto) {
    return this.queries.findAllPublic(filter);
  }
  findAllAdmin(filter: FilterPostDto) {
    return this.queries.findAllAdmin(filter);
  }
  findOneAdmin(id: string) {
    return this.queries.findOneAdmin(id);
  }
  findBySlugPublic(slug: string) {
    return this.queries.findBySlugPublic(slug);
  }
  create(dto: CreatePostDraftDto, userId: string, req?: any) {
    return this.commands.create(dto, userId, req);
  }
  update(id: string, dto: UpdatePostContentDto, req?: any) {
    return this.commands.update(id, dto, req);
  }
  publishDueScheduledPosts(now?: Date) {
    return this.workflow.publishDueScheduledPosts(now);
  }
}
