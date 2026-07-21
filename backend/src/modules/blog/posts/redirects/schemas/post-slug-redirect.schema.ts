import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class PostSlugRedirect extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true })
  oldSlug: string;

  @Prop({ required: true, lowercase: true, trim: true })
  newSlug: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  createdAt: Date;
}

export const PostSlugRedirectSchema =
  SchemaFactory.createForClass(PostSlugRedirect);
PostSlugRedirectSchema.index({ oldSlug: 1 }, { unique: true });
PostSlugRedirectSchema.index({ postId: 1 });
