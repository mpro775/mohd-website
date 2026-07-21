import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TagsService } from './tags.service';
import { PublicTagsController, AdminTagsController } from './tags.controller';
import { Tag, TagSchema } from './schemas/tag.schema';
import { Post, PostSchema } from '../posts/schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tag.name, schema: TagSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [PublicTagsController, AdminTagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
