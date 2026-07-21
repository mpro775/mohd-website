import { createHash } from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrackPostViewDto } from './dto/track-post-view.dto';
import { Post, PostStatus } from './schemas/post.schema';
import { PostDeviceType, PostView } from './views/schemas/post-view.schema';

type RequestLike = {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
};

@Injectable()
export class PostViewsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(PostView.name) private readonly viewModel: Model<PostView>,
    private readonly config: ConfigService,
  ) {}

  async track(postId: string, dto: TrackPostViewDto, req: RequestLike) {
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

    const salt =
      this.config.get<string>('ANALYTICS_HASH_SALT') ??
      'local-development-analytics-salt';
    const forwarded = String(req.headers?.['x-forwarded-for'] ?? '')
      .split(',')[0]
      .trim();
    const ip = forwarded || req.ip || 'unknown';
    const visitorHash = this.hash(`${salt}:${ip}`);
    const sessionHash = dto.sessionId
      ? this.hash(`${salt}:${dto.sessionId}`)
      : undefined;
    const dateKey = new Date().toISOString().slice(0, 10);
    let referrerDomain: string | undefined;
    if (dto.referrer) {
      try {
        referrerDomain = new URL(dto.referrer).hostname.slice(0, 253);
      } catch {
        /* validated DTO */
      }
    }

    const result = await this.viewModel.updateOne(
      { postId, visitorHash, dateKey },
      {
        $setOnInsert: {
          postId,
          visitorHash,
          sessionHash,
          dateKey,
          referrerDomain,
          deviceType,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
    const recorded = result.upsertedCount === 1;
    if (recorded) {
      await this.postModel.updateOne(
        { _id: postId },
        { $inc: { viewCount: 1, uniqueViewCount: 1 } },
      );
    }
    return { recorded };
  }

  hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
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
