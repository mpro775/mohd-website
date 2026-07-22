import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import {
  AdminBlogController,
  AdminPostsController,
  PublicPostsController,
} from './posts.controller';
import { Post, PostSchema } from './schemas/post.schema';
import { MediaModule } from '../../media/media.module';
import {
  Category,
  CategorySchema,
} from '../categories/schemas/category.schema';
import { Tag, TagSchema } from '../tags/schemas/tag.schema';
import { PostsScheduler } from './posts.scheduler';
import {
  PostRevision,
  PostRevisionSchema,
} from './revisions/schemas/post-revision.schema';
import {
  PostSlugRedirect,
  PostSlugRedirectSchema,
} from './redirects/schemas/post-slug-redirect.schema';
import { PostView, PostViewSchema } from './views/schemas/post-view.schema';
import {
  PostVisitor,
  PostVisitorSchema,
} from './views/schemas/post-visitor.schema';
import {
  PostViewEvent,
  PostViewEventSchema,
} from './views/schemas/post-view-event.schema';
import { PostsQueryService } from './posts-query.service';
import { PostsCommandService } from './posts-command.service';
import { PostWorkflowService } from './post-workflow.service';
import { PostRevisionsService } from './post-revisions.service';
import { PostReadinessService } from './post-readiness.service';
import { PostViewsService } from './post-views.service';
import { PostRelatedService } from './post-related.service';
import { PostsRevalidationService } from './posts-revalidation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Tag.name, schema: TagSchema },
      { name: PostRevision.name, schema: PostRevisionSchema },
      { name: PostSlugRedirect.name, schema: PostSlugRedirectSchema },
      { name: PostView.name, schema: PostViewSchema },
      { name: PostVisitor.name, schema: PostVisitorSchema },
      { name: PostViewEvent.name, schema: PostViewEventSchema },
    ]),
    MediaModule,
  ],
  controllers: [
    PublicPostsController,
    AdminPostsController,
    AdminBlogController,
  ],
  providers: [
    PostsService,
    PostsQueryService,
    PostsCommandService,
    PostWorkflowService,
    PostRevisionsService,
    PostReadinessService,
    PostViewsService,
    PostRelatedService,
    PostsRevalidationService,
    PostsScheduler,
  ],
  exports: [PostsService, PostsQueryService],
})
export class PostsModule {}
