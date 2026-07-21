import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { Category } from '../blog/categories/schemas/category.schema';
import { Post, PostStatus } from '../blog/posts/schemas/post.schema';
import { Tag } from '../blog/tags/schemas/tag.schema';

export type SeoEntry = {
  type: 'post' | 'category' | 'tag';
  path: string;
  lastModified: Date;
  publishedAt?: Date;
  title?: string;
  description?: string;
};

@Injectable()
export class SeoService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Tag.name) private readonly tagModel: Model<Tag>,
  ) {}

  async getEntries(page: number, limit: number) {
    const now = new Date();
    const postFilter = {
      status: PostStatus.PUBLISHED,
      publishedAt: { $lte: now },
      allowIndexing: { $ne: false },
      deletedAt: { $exists: false },
    };
    const [posts, categories, tags, tagCounts] = await Promise.all([
      this.postModel
        .find(postFilter)
        .select('slug title summary publishedAt updatedAt')
        .sort({ publishedAt: -1 })
        .lean(),
      this.categoryModel
        .find({ isActive: true, deletedAt: { $exists: false } })
        .select('slug updatedAt')
        .lean(),
      this.tagModel
        .find({ isActive: true, deletedAt: { $exists: false } })
        .select('slug updatedAt')
        .lean(),
      this.postModel.aggregate([
        { $match: postFilter },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
      ]),
    ]);
    const tagCountMap = new Map(
      tagCounts.map((item) => [item._id.toString(), item.count]),
    );
    const entries: SeoEntry[] = [
      ...posts.map((post) => ({
        type: 'post' as const,
        path: `/blog/${post.slug}`,
        lastModified: post.updatedAt,
        publishedAt: post.publishedAt,
        title: post.title,
        description: post.summary,
      })),
      ...categories.map((category) => ({
        type: 'category' as const,
        path: `/blog/category/${category.slug}`,
        lastModified: category.updatedAt,
      })),
      ...tags
        .filter((tag) => (tagCountMap.get(tag._id.toString()) ?? 0) >= 2)
        .map((tag) => ({
          type: 'tag' as const,
          path: `/blog/tag/${tag.slug}`,
          lastModified: tag.updatedAt,
        })),
    ];
    return createPaginatedResponse(
      entries.slice((page - 1) * limit, page * limit),
      entries.length,
      page,
      limit,
    );
  }
}
