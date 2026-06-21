import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export enum PostStatus {
  PUBLISHED = 'published',
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ARCHIVED = 'archived',
}

export interface ISEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImageMediaId?: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true })
  summary: string;

  @Prop()
  excerpt: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  featuredImageMediaId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  coverImageMediaId?: Types.ObjectId;

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
  scheduledAt: Date;

  @Prop({ type: Date })
  lastPublishedAt: Date;

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

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Boolean, default: true })
  allowIndexing: boolean;

  @Prop()
  canonicalUrl: string;

  @Prop({ type: Object })
  seo: ISEO;

  createdAt: Date;
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ title: 'text', summary: 'text', content: 'text' });
PostSchema.index({ category: 1, status: 1, publishDate: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ author: 1 });
