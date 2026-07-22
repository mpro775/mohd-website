import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ collection: 'post_visitors' })
export class PostVisitor extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  @Prop({ required: true })
  visitorHash: string;

  @Prop({ required: true })
  firstSeenAt: Date;

  @Prop({ required: true })
  lastSeenAt: Date;
}

export const PostVisitorSchema = SchemaFactory.createForClass(PostVisitor);
PostVisitorSchema.index({ postId: 1, visitorHash: 1 }, { unique: true });
