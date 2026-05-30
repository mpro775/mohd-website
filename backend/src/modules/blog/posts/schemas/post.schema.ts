import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum PostStatus {
  PUBLISHED = 'published',
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
}

export interface ISEO {
  metaTitle: string;
  metaDescription: string;
}

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true })
  summary: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  featuredImage: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  category: MongooseSchema.Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Tag' }],
    default: [],
  })
  tags: MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  publishDate: Date;

  @Prop({ type: Date })
  updatedDate: Date;

  @Prop({
    type: String,
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: Number, default: 5 })
  readTime: number;

  @Prop({ type: Object })
  seo: ISEO;

  createdAt: Date;
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Indexes for better performance
PostSchema.index({ title: 'text', summary: 'text', content: 'text' });
PostSchema.index({ slug: 1 }, { unique: true });
PostSchema.index({ category: 1, status: 1, publishDate: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ author: 1 });
