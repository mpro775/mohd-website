import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type PostDeviceType =
  | 'desktop'
  | 'mobile'
  | 'tablet'
  | 'bot'
  | 'unknown';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class PostView extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  @Prop({ required: true })
  visitorHash: string;

  @Prop()
  sessionHash?: string;

  @Prop({ required: true })
  dateKey: string;

  @Prop()
  referrerDomain?: string;

  @Prop({
    enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'],
    default: 'unknown',
  })
  deviceType: PostDeviceType;

  createdAt: Date;
}

export const PostViewSchema = SchemaFactory.createForClass(PostView);
PostViewSchema.index(
  { postId: 1, visitorHash: 1, dateKey: 1 },
  { unique: true },
);
PostViewSchema.index({ postId: 1, createdAt: -1 });
