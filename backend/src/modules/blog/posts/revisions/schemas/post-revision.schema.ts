import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type PostRevisionReason =
  | 'manual_save'
  | 'autosave'
  | 'publish'
  | 'schedule'
  | 'restore'
  | 'migration';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class PostRevision extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  revisionNumber: number;

  @Prop({ required: true, min: 1 })
  version: number;

  @Prop({
    required: true,
    enum: [
      'manual_save',
      'autosave',
      'publish',
      'schedule',
      'restore',
      'migration',
    ],
  })
  reason: PostRevisionReason;

  @Prop({ type: Object, required: true })
  snapshot: Record<string, unknown>;

  @Prop({ required: true })
  contentHash: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  createdAt: Date;
}

export const PostRevisionSchema = SchemaFactory.createForClass(PostRevision);
PostRevisionSchema.index({ postId: 1, revisionNumber: -1 }, { unique: true });
PostRevisionSchema.index({ postId: 1, createdAt: -1 });
