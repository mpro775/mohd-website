import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service';
import {
  PublicCategoriesController,
  AdminCategoriesController,
} from './categories.controller';
import { Category, CategorySchema } from './schemas/category.schema';
import { Post, PostSchema } from '../posts/schemas/post.schema';
import { PostsRevalidationService } from '../posts/posts-revalidation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [PublicCategoriesController, AdminCategoriesController],
  providers: [CategoriesService, PostsRevalidationService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
