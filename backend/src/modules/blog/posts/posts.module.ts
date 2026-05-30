import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import {
  AdminPostsController,
  PublicPostsController,
} from './posts.controller';
import { Post, PostSchema } from './schemas/post.schema';
import { MediaModule } from '../../media/media.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MediaModule,
  ],
  controllers: [PublicPostsController, AdminPostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
