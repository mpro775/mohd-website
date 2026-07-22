import { createHmac } from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrackPostViewDto } from './dto/track-post-view.dto';
import { Post, PostStatus } from './schemas/post.schema';
import { PostDeviceType, PostView } from './views/schemas/post-view.schema';
import { PostVisitor } from './views/schemas/post-visitor.schema';
import { PostViewEvent } from './views/schemas/post-view-event.schema';

type RequestLike = {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
};

@Injectable()
export class PostViewsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(PostView.name)
    private readonly dailyViewModel: Model<PostView>,
    @InjectModel(PostVisitor.name)
    private readonly postVisitorModel: Model<PostVisitor>,
    @InjectModel(PostViewEvent.name)
    private readonly postViewEventModel: Model<PostViewEvent>,
    private readonly config: ConfigService,
  ) {}

  async track(postId: string, dto: TrackPostViewDto, req: RequestLike) {
    if (dto.eventId) {
      try {
        await this.postViewEventModel.create({ eventId: dto.eventId });
      } catch (e: any) {
        if (e.code === 11000) {
          // duplicate eventId
          return { recorded: false, reason: 'duplicate_event' };
        }
      }
    }

    const post = await this.postModel.exists({
      _id: postId,
      status: PostStatus.PUBLISHED,
      publishedAt: { $lte: new Date() },
      deletedAt: { $exists: false },
    });
    if (!post) throw new NotFoundException('المقال غير موجود');

    const userAgent = String(req.headers?.['user-agent'] ?? '');
    const deviceType = this.deviceType(userAgent);
    if (deviceType === 'bot') return { recorded: false, reason: 'bot' };

    const forwarded = String(req.headers?.['x-forwarded-for'] ?? '')
      .split(',')[0]
      .trim();
    const ip = forwarded || req.ip || 'unknown';
    const visitorHash = this.hash(ip);
    const sessionHash = dto.sessionId ? this.hash(dto.sessionId) : undefined;
    const dateKey = new Date().toISOString().slice(0, 10);
    const now = new Date();

    let referrerDomain: string | undefined;
    if (dto.referrer) {
      try {
        referrerDomain = new URL(dto.referrer).hostname.slice(0, 253);
      } catch {
        /* validated DTO */
      }
    }

    const visitorResult = await this.postVisitorModel.updateOne(
      { postId, visitorHash },
      {
        $setOnInsert: {
          postId,
          visitorHash,
          firstSeenAt: now,
        },
        $set: {
          lastSeenAt: now,
        },
      },
      { upsert: true },
    );

    await this.dailyViewModel.updateOne(
      { postId, visitorHash, dateKey },
      {
        $setOnInsert: {
          postId,
          visitorHash,
          sessionHash,
          dateKey,
          firstSeenAt: now,
        },
        $set: {
          lastSeenAt: now,
          referrerDomain,
          deviceType,
        },
        $inc: {
          hits: 1,
        },
      },
      { upsert: true },
    );

    const isNewVisitor = visitorResult.upsertedCount === 1;

    await this.postModel.updateOne(
      { _id: postId },
      {
        $inc: {
          viewCount: 1,
          uniqueViewCount: isNewVisitor ? 1 : 0,
        },
      },
    );

    return { recorded: true, newVisitor: isNewVisitor };
  }

  hash(value: string): string {
    const salt = this.config.getOrThrow<string>('ANALYTICS_HASH_SALT');
    return createHmac('sha256', salt).update(value).digest('hex');
  }

  deviceType(userAgent: string): PostDeviceType {
    if (
      /bot|crawler|spider|slurp|preview|facebookexternalhit|whatsapp/i.test(
        userAgent,
      )
    )
      return 'bot';
    if (/ipad|tablet/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|android/i.test(userAgent)) return 'mobile';
    return userAgent ? 'desktop' : 'unknown';
  }
}
