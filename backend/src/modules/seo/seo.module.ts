import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { Post, PostSchema } from '../blog/posts/schemas/post.schema';
import {
  Category,
  CategorySchema,
} from '../blog/categories/schemas/category.schema';
import { Tag, TagSchema } from '../blog/tags/schemas/tag.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Tag.name, schema: TagSchema },
    ]),
  ],
  controllers: [SeoController],
  providers: [SeoService],
  exports: [SeoService],
})
export class SeoModule {}
