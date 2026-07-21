import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaService } from '../../media/media.service';
import { mapPostToPublicListItem } from './mappers/post.mapper';
import { Post, PostStatus } from './schemas/post.schema';

const publicFilter = () => ({
  status: PostStatus.PUBLISHED,
  publishedAt: { $lte: new Date() },
  deletedAt: { $exists: false },
});

export function scoreRelatedPost(
  source: { category?: any; tags?: any[] },
  candidate: { category?: any; tags?: any[] },
): number {
  const sourceTags = new Set(
    (source.tags ?? []).map(
      (item) => item?._id?.toString() ?? item?.toString(),
    ),
  );
  return (candidate.category?._id?.toString() ??
    candidate.category?.toString()) ===
    (source.category?._id?.toString() ?? source.category?.toString())
    ? 5 +
        (candidate.tags ?? []).filter((tag) =>
          sourceTags.has(tag?._id?.toString() ?? tag?.toString()),
        ).length *
          2
    : (candidate.tags ?? []).filter((tag) =>
        sourceTags.has(tag?._id?.toString() ?? tag?.toString()),
      ).length * 2;
}

@Injectable()
export class PostRelatedService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    private readonly mediaService: MediaService,
  ) {}

  async related(slug: string, limit = 3) {
    const post = await this.postModel
      .findOne({ slug, ...publicFilter() })
      .lean();
    if (!post) throw new NotFoundException('المقال غير موجود');
    const manualIds = post.relatedPostIds ?? [];
    const manual = await this.postModel
      .find({ _id: { $in: manualIds }, ...publicFilter() })
      .populate('category', 'name slug')
      .populate('tags', 'name slug color')
      .lean();
    const byId = new Map(manual.map((item) => [item._id.toString(), item]));
    const orderedManual = manualIds
      .map((item) => byId.get(item.toString()))
      .filter(Boolean) as any[];

    let selected = orderedManual.slice(0, limit);
    if (selected.length < limit) {
      const candidates = await this.postModel
        .find({
          _id: { $nin: [post._id, ...selected.map((item) => item._id)] },
          ...publicFilter(),
        })
        .populate('category', 'name slug')
        .populate('tags', 'name slug color')
        .sort({ publishedAt: -1 })
        .limit(100)
        .lean();
      const scored = candidates
        .map((candidate) => ({
          candidate,
          score: scoreRelatedPost(post, candidate),
        }))
        .sort(
          (a, b) =>
            b.score - a.score ||
            +new Date(b.candidate.publishedAt!) -
              +new Date(a.candidate.publishedAt!),
        );
      selected = [...selected, ...scored.map((item) => item.candidate)].slice(
        0,
        limit,
      );
    }
    const mediaMap = await this.mediaService.resolveMediaObjectsByIds(
      selected.map((item) => item.featuredImageMediaId),
    );
    return selected.map((item) => mapPostToPublicListItem(item, mediaMap));
  }

  async navigation(slug: string) {
    const post = await this.postModel
      .findOne({ slug, ...publicFilter() })
      .select('publishedAt')
      .lean();
    if (!post) throw new NotFoundException('المقال غير موجود');
    const [previous, next] = await Promise.all([
      this.postModel
        .findOne({ ...publicFilter(), publishedAt: { $lt: post.publishedAt } })
        .select('title slug')
        .sort({ publishedAt: -1 })
        .lean(),
      this.postModel
        .findOne({ ...publicFilter(), publishedAt: { $gt: post.publishedAt } })
        .select('title slug')
        .sort({ publishedAt: 1 })
        .lean(),
    ]);
    return { previous, next };
  }
}
