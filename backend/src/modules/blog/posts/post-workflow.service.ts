import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { PostReadinessService } from './post-readiness.service';
import { PostRevisionsService } from './post-revisions.service';
import { PostsRevalidationService } from './posts-revalidation.service';
import { Post, PostStatus } from './schemas/post.schema';

export const POST_TRANSITIONS: Record<PostStatus, PostStatus[]> = {
  [PostStatus.DRAFT]: [
    PostStatus.IN_REVIEW,
    PostStatus.SCHEDULED,
    PostStatus.PUBLISHED,
    PostStatus.ARCHIVED,
  ],
  [PostStatus.CHANGES_REQUESTED]: [PostStatus.DRAFT, PostStatus.IN_REVIEW],
  [PostStatus.IN_REVIEW]: [
    PostStatus.CHANGES_REQUESTED,
    PostStatus.APPROVED,
    PostStatus.PUBLISHED,
  ],
  [PostStatus.APPROVED]: [
    PostStatus.SCHEDULED,
    PostStatus.PUBLISHED,
    PostStatus.DRAFT,
  ],
  [PostStatus.SCHEDULED]: [
    PostStatus.DRAFT,
    PostStatus.PUBLISHED,
    PostStatus.ARCHIVED,
  ],
  [PostStatus.PUBLISHED]: [PostStatus.DRAFT, PostStatus.ARCHIVED],
  [PostStatus.ARCHIVED]: [PostStatus.DRAFT],
};

type RequestLike = { user?: { userId?: string; id?: string; _id?: string } };

@Injectable()
export class PostWorkflowService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    private readonly readiness: PostReadinessService,
    private readonly revisions: PostRevisionsService,
    private readonly revalidation: PostsRevalidationService,
    private readonly audit: AuditLogsService,
  ) {}

  isTransitionAllowed(from: PostStatus, to: PostStatus): boolean {
    return POST_TRANSITIONS[from]?.includes(to) ?? false;
  }

  submitReview(id: string, version: number, req?: RequestLike) {
    return this.transition(
      id,
      PostStatus.IN_REVIEW,
      version,
      req,
      'post.submitted_for_review',
    );
  }

  requestChanges(
    id: string,
    version: number,
    req?: RequestLike,
    message?: string,
  ) {
    return this.transition(
      id,
      PostStatus.CHANGES_REQUESTED,
      version,
      req,
      'post.changes_requested',
      { reviewer: this.userId(req), auditMetadata: { message } },
    );
  }

  approve(id: string, version: number, req?: RequestLike) {
    return this.transition(
      id,
      PostStatus.APPROVED,
      version,
      req,
      'post.approved',
      { reviewer: this.userId(req) },
    );
  }

  unpublish(id: string, version: number, req?: RequestLike) {
    return this.transition(
      id,
      PostStatus.DRAFT,
      version,
      req,
      'post.unpublished',
      { scheduledAt: undefined },
    );
  }

  cancelSchedule(id: string, version: number, req?: RequestLike) {
    return this.transition(
      id,
      PostStatus.DRAFT,
      version,
      req,
      'post.schedule_cancelled',
      { scheduledAt: undefined },
    );
  }

  archive(id: string, version: number, req?: RequestLike) {
    return this.transition(
      id,
      PostStatus.ARCHIVED,
      version,
      req,
      'post.archived',
      { scheduledAt: undefined },
    );
  }

  async publish(id: string, expectedVersion: number, req?: RequestLike) {
    const post = await this.load(id, expectedVersion);
    if (!this.isTransitionAllowed(post.status, PostStatus.PUBLISHED))
      this.invalid(post.status, PostStatus.PUBLISHED);
    const readiness = await this.readiness.check(post, expectedVersion);
    if (!readiness.ready) {
      throw new BadRequestException({ code: 'POST_NOT_READY', ...readiness });
    }
    const userId = this.userId(req);
    await this.revisions.create(post, userId, 'publish');
    const now = new Date();
    const updated = await this.postModel.findOneAndUpdate(
      { _id: id, version: expectedVersion, deletedAt: { $exists: false } },
      {
        $set: {
          status: PostStatus.PUBLISHED,
          firstPublishedAt: post.firstPublishedAt ?? now,
          publishedAt: now,
          lastPublishedAt: now,
          publisher: userId,
          statusChangedAt: now,
          statusChangedBy: userId,
        },
        $unset: { scheduledAt: 1 },
        $inc: { version: 1 },
      },
      { new: true },
    );
    if (!updated) this.versionConflict(expectedVersion);
    await this.audit.log({
      action: 'post.published',
      resource: 'Post',
      resourceId: id,
      metadata: { version: updated.version },
      request: req,
    });
    await this.revalidatePost(updated);
    return updated;
  }

  async schedule(id: string, dto: SchedulePostDto, req?: RequestLike) {
    const when = new Date(dto.scheduledAt);
    if (Number.isNaN(when.getTime()) || when <= new Date())
      throw new BadRequestException('موعد الجدولة يجب أن يكون في المستقبل');
    try {
      new Intl.DateTimeFormat('en', { timeZone: dto.sourceTimezone }).format();
    } catch {
      throw new BadRequestException('المنطقة الزمنية غير صالحة');
    }
    const post = await this.load(id, dto.expectedVersion);
    if (!this.isTransitionAllowed(post.status, PostStatus.SCHEDULED))
      this.invalid(post.status, PostStatus.SCHEDULED);
    const readiness = await this.readiness.check(post, dto.expectedVersion);
    if (!readiness.ready)
      throw new BadRequestException({ code: 'POST_NOT_READY', ...readiness });
    const userId = this.userId(req);
    await this.revisions.create(post, userId, 'schedule');
    const updated = await this.postModel.findOneAndUpdate(
      { _id: id, version: dto.expectedVersion, deletedAt: { $exists: false } },
      {
        $set: {
          status: PostStatus.SCHEDULED,
          scheduledAt: when,
          statusChangedAt: new Date(),
          statusChangedBy: userId,
        },
        $unset: { publishedAt: 1 },
        $inc: { version: 1 },
      },
      { new: true },
    );
    if (!updated) this.versionConflict(dto.expectedVersion);
    await this.audit.log({
      action: 'post.scheduled',
      resource: 'Post',
      resourceId: id,
      metadata: { scheduledAt: when, sourceTimezone: dto.sourceTimezone },
      request: req,
    });
    return updated;
  }

  async publishDueScheduledPosts(now = new Date()) {
    const due = await this.postModel
      .find({
        status: PostStatus.SCHEDULED,
        scheduledAt: { $lte: now },
        deletedAt: { $exists: false },
      })
      .select('_id version firstPublishedAt author statusChangedBy')
      .lean();
    let published = 0;
    let failed = 0;
    for (const candidate of due) {
      try {
        const actor = candidate.statusChangedBy ?? candidate.author;
        const updated = await this.postModel.findOneAndUpdate(
          {
            _id: candidate._id,
            status: PostStatus.SCHEDULED,
            scheduledAt: { $lte: now },
            deletedAt: { $exists: false },
          },
          {
            $set: {
              status: PostStatus.PUBLISHED,
              firstPublishedAt: candidate.firstPublishedAt ?? now,
              publishedAt: now,
              lastPublishedAt: now,
              publisher: actor,
              statusChangedAt: now,
              statusChangedBy: actor,
            },
            $unset: { scheduledAt: 1 },
            $inc: { version: 1 },
          },
          { new: true },
        );
        if (!updated) continue;
        published += 1;
        await this.revisions.create(updated, actor.toString(), 'publish');
        await this.audit.log({
          action: 'post.published',
          resource: 'Post',
          resourceId: updated._id.toString(),
          metadata: { source: 'scheduler', version: updated.version },
        });
        await this.revalidatePost(updated);
      } catch {
        failed += 1;
      }
    }
    return { matched: due.length, published, failed };
  }

  private async transition(
    id: string,
    target: PostStatus,
    expectedVersion: number,
    req: RequestLike | undefined,
    action: string,
    options: Record<string, any> = {},
  ) {
    const post = await this.load(id, expectedVersion);
    if (!this.isTransitionAllowed(post.status, target))
      this.invalid(post.status, target);
    const { auditMetadata, ...fields } = options;
    const update: Record<string, any> = {
      $set: {
        status: target,
        statusChangedAt: new Date(),
        statusChangedBy: this.userId(req),
        ...Object.fromEntries(
          Object.entries(fields).filter(([, value]) => value !== undefined),
        ),
      },
      $inc: { version: 1 },
    };
    const unset = Object.entries(fields)
      .filter(([, value]) => value === undefined)
      .map(([key]) => key);
    if (unset.length)
      update.$unset = Object.fromEntries(unset.map((key) => [key, 1]));
    const updated = await this.postModel.findOneAndUpdate(
      {
        _id: id,
        version: expectedVersion,
        status: post.status,
        deletedAt: { $exists: false },
      },
      update,
      { new: true },
    );
    if (!updated) this.versionConflict(expectedVersion);
    await this.audit.log({
      action,
      resource: 'Post',
      resourceId: id,
      metadata: {
        from: post.status,
        to: target,
        version: updated.version,
        ...auditMetadata,
      },
      request: req,
    });
    if (
      [PostStatus.DRAFT, PostStatus.ARCHIVED].includes(target) &&
      post.status === PostStatus.PUBLISHED
    ) {
      await this.revalidatePost(updated);
    }
    return updated;
  }

  private async load(id: string, expectedVersion: number) {
    const post = await this.postModel.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });
    if (!post) throw new NotFoundException('المقال غير موجود');
    if (post.version !== expectedVersion) this.versionConflict(post.version);
    return post;
  }

  private async revalidatePost(post: Post): Promise<void> {
    await (post as any).populate([
      { path: 'category', select: 'slug' },
      { path: 'tags', select: 'slug' },
    ]);
    await this.revalidation.revalidate(this.revalidation.tagsForPost(post));
  }

  private invalid(from: PostStatus, to: PostStatus): never {
    throw new ConflictException({
      code: 'POST_TRANSITION_INVALID',
      message: `لا يمكن نقل المقال من ${from} إلى ${to}`,
    });
  }

  private versionConflict(serverVersion: number): never {
    throw new ConflictException({
      code: 'POST_VERSION_CONFLICT',
      serverVersion,
      message: 'تم تعديل المقال من جلسة أخرى',
    });
  }

  private userId(req?: RequestLike): string {
    const value = req?.user?.userId || req?.user?.id || req?.user?._id;
    if (!value) throw new BadRequestException('تعذر تحديد المستخدم الحالي');
    return value;
  }
}
