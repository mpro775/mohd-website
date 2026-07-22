import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
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
    const skip = (page - 1) * limit;
    const now = new Date();

    const pipeline: PipelineStage[] = [
      {
        $match: {
          status: PostStatus.PUBLISHED,
          publishedAt: { $lte: now },
          allowIndexing: { $ne: false },
          deletedAt: { $exists: false },
        },
      },
      {
        $project: {
          type: { $literal: 'post' },
          path: { $concat: ['/blog/', '$slug'] },
          lastModified: '$updatedAt',
          publishedAt: 1,
          title: 1,
          description: '$summary',
          sortGroup: { $literal: 1 },
        },
      },
      {
        $unionWith: {
          coll: 'categories',
          pipeline: [
            {
              $match: {
                isActive: true,
                deletedAt: { $exists: false },
              },
            },
            {
              $project: {
                type: { $literal: 'category' },
                path: {
                  $concat: ['/blog/category/', '$slug'],
                },
                lastModified: '$updatedAt',
                sortGroup: { $literal: 2 },
              },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: 'tags',
          pipeline: [
            {
              $match: {
                isActive: true,
                deletedAt: { $exists: false },
              },
            },
            {
              $lookup: {
                from: 'posts',
                let: { tagId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $in: ['$$tagId', '$tags'] },
                          { $eq: ['$status', 'published'] },
                          { $lte: ['$publishedAt', now] },
                          { $ne: ['$allowIndexing', false] },
                          { $eq: [{ $type: '$deletedAt' }, 'missing'] },
                        ],
                      },
                    },
                  },
                  { $limit: 2 },
                ],
                as: 'publishedPosts',
              },
            },
            {
              $match: {
                $expr: {
                  $gte: [{ $size: '$publishedPosts' }, 2],
                },
              },
            },
            {
              $project: {
                type: { $literal: 'tag' },
                path: {
                  $concat: ['/blog/tag/', '$slug'],
                },
                lastModified: '$updatedAt',
                sortGroup: { $literal: 3 },
              },
            },
          ],
        },
      },
      {
        $sort: {
          sortGroup: 1,
          lastModified: -1,
          _id: 1,
        },
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                sortGroup: 0,
                publishedPosts: 0,
              },
            },
          ],
          count: [{ $count: 'total' }],
        },
      },
    ];

    const [result] = await this.postModel.aggregate(pipeline);

    const total = result?.count?.[0]?.total ?? 0;

    return createPaginatedResponse(
      result?.data ?? [],
      total,
      page,
      limit,
    );
  }
}
