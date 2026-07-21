import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PostRevision,
  PostRevisionReason,
} from './revisions/schemas/post-revision.schema';

const SNAPSHOT_FIELDS = [
  'title',
  'slug',
  'summary',
  'excerpt',
  'content',
  'featuredImageMediaId',
  'coverImageMediaId',
  'category',
  'tags',
  'relatedPostIds',
  'isFeatured',
  'featuredOrder',
  'allowIndexing',
  'canonicalUrl',
  'seo',
] as const;

@Injectable()
export class PostRevisionsService {
  constructor(
    @InjectModel(PostRevision.name)
    private readonly revisionModel: Model<PostRevision>,
  ) {}

  snapshot(post: any): Record<string, unknown> {
    const source = typeof post.toObject === 'function' ? post.toObject() : post;
    return Object.fromEntries(
      SNAPSHOT_FIELDS.map((field) => [field, source[field]]).filter(
        ([, value]) => value !== undefined,
      ),
    );
  }

  async create(
    post: any,
    createdBy: string,
    reason: PostRevisionReason,
  ): Promise<PostRevision | null> {
    if (reason === 'autosave') {
      const recent = await this.revisionModel.findOne({
        postId: post._id,
        reason,
        createdAt: { $gte: new Date(Date.now() - 5 * 60_000) },
      });
      if (recent) return null;
    }

    const latest = await this.revisionModel
      .findOne({ postId: post._id })
      .sort({ revisionNumber: -1 });
    if (latest?.contentHash === post.contentHash && reason === 'autosave') {
      return null;
    }

    const revision = await this.revisionModel.create({
      postId: post._id,
      revisionNumber: (latest?.revisionNumber ?? 0) + 1,
      version: post.version,
      reason,
      snapshot: this.snapshot(post),
      contentHash: post.contentHash,
      createdBy: new Types.ObjectId(createdBy),
    });
    await this.prune(post._id);
    return revision;
  }

  async list(postId: string) {
    return this.revisionModel
      .find({ postId })
      .select('-snapshot.content')
      .populate('createdBy', 'name email')
      .sort({ revisionNumber: -1 })
      .limit(200);
  }

  async findOne(postId: string, revisionId: string) {
    const revision = await this.revisionModel
      .findOne({ _id: revisionId, postId })
      .populate('createdBy', 'name email');
    if (!revision) throw new NotFoundException('الإصدار غير موجود');
    return revision;
  }

  private async prune(postId: Types.ObjectId): Promise<void> {
    const protectedReasons: PostRevisionReason[] = ['publish', 'restore'];
    const ordinary = await this.revisionModel
      .find({ postId, reason: { $nin: protectedReasons } })
      .sort({ createdAt: -1 })
      .skip(100)
      .select('_id');
    if (ordinary.length) {
      await this.revisionModel.deleteMany({
        _id: { $in: ordinary.map((item) => item._id) },
      });
    }
  }
}
