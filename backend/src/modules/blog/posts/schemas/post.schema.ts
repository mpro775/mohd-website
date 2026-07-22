import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export enum PostStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  CHANGES_REQUESTED = 'changes_requested',
  APPROVED = 'approved',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface ISEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImageMediaId?: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ trim: true, default: '' })
  title: string;

  @Prop({ lowercase: true, trim: true })
  slug?: string;

  @Prop({ type: [String], default: [] })
  previousSlugs: string[];

  @Prop({ trim: true, default: '' })
  summary: string;

  @Prop()
  excerpt: string;

  @Prop({ default: '' })
  content: string;

  @Prop({ type: String, enum: ['markdown'], default: 'markdown' })
  contentFormat: 'markdown';

  @Prop({ type: Number, default: 1, min: 1 })
  contentVersion: number;

  @Prop({ type: Number, default: 1, min: 1 })
  version: number;

  @Prop({ required: true, default: '' })
  contentHash: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  featuredImageMediaId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  coverImageMediaId?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Media' }], default: [] })
  contentMediaIds: Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  category?: Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Tag' }],
    default: [],
  })
  tags: Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Post' }],
    default: [],
  })
  relatedPostIds: Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  reviewer?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  publisher?: Types.ObjectId;

  @Prop({ type: Date })
  scheduledAt?: Date;

  @Prop({ type: Date })
  firstPublishedAt?: Date;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: Date })
  lastPublishedAt?: Date;

  @Prop({
    type: String,
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Prop({ type: Date })
  statusChangedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  statusChangedBy?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  viewCount: number;

  @Prop({ type: Number, default: 0 })
  uniqueViewCount: number;

  @Prop({ type: Number, default: 1, min: 1 })
  readTime: number;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Number, min: 0 })
  featuredOrder?: number;

  @Prop({ type: Boolean, default: true })
  allowIndexing: boolean;

  @Prop()
  canonicalUrl: string;

  @Prop({ type: Object })
  seo: ISEO;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  deletedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index(
  { slug: 1 },
  {
    unique: true,
    partialFilterExpression: {
      slug: { $type: 'string' },
    },
  },
);
PostSchema.index({ previousSlugs: 1 });
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ status: 1, scheduledAt: 1 });
PostSchema.index({ category: 1, status: 1, publishedAt: -1 });
PostSchema.index({ tags: 1, status: 1, publishedAt: -1 });
PostSchema.index({ isFeatured: 1, featuredOrder: 1, publishedAt: -1 });
PostSchema.index({ deletedAt: 1 });
PostSchema.index(
  { title: 'text', summary: 'text', content: 'text' },
  {
    weights: { title: 10, summary: 5, content: 1 },
    default_language: 'none',
  },
);
PostSchema.index({
  status: 1,
  allowIndexing: 1,
  deletedAt: 1,
  publishedAt: -1,
  updatedAt: -1,
});
