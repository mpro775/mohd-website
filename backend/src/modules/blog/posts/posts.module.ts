import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import {
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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Tag.name, schema: TagSchema },
    ]),
    MediaModule,
  ],
  controllers: [PublicPostsController, AdminPostsController],
  providers: [PostsService, PostsScheduler],
  exports: [PostsService],
})
export class PostsModule {}
