import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [CategoriesModule, TagsModule, PostsModule],
  exports: [CategoriesModule, TagsModule, PostsModule],
})
export class BlogModule {}
