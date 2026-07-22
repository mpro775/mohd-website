import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type PostDeviceType =
  | 'desktop'
  | 'mobile'
  | 'tablet'
  | 'bot'
  | 'unknown';

@Schema({ collection: 'post_views_daily' })
export class PostView extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  @Prop({ required: true })
  visitorHash: string;

  @Prop()
  sessionHash?: string;

  @Prop({ required: true })
  dateKey: string;

  @Prop({ default: 0 })
  hits: number;

  @Prop({ required: true })
  firstSeenAt: Date;

  @Prop({ required: true })
  lastSeenAt: Date;

  @Prop()
  referrerDomain?: string;

  @Prop({
    enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'],
    default: 'unknown',
  })
  deviceType: PostDeviceType;
}

export const PostViewSchema = SchemaFactory.createForClass(PostView);
PostViewSchema.index(
  { postId: 1, visitorHash: 1, dateKey: 1 },
  { unique: true },
);
PostViewSchema.index({ postId: 1, firstSeenAt: -1 });
