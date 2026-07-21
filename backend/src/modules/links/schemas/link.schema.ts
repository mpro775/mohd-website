import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  LinkCategory,
  LinkPlatform,
} from '../../../common/taxonomy/link-taxonomy';

@Schema({ timestamps: true })
export class Link extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  iconMediaId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: LinkPlatform,
    default: LinkPlatform.OTHER,
    trim: true,
  })
  platform: LinkPlatform;

  @Prop({
    type: String,
    enum: LinkCategory,
    default: LinkCategory.OTHER,
    trim: true,
  })
  category: LinkCategory;

  @Prop({ type: Boolean, default: true })
  openInNewTab: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ type: Number, default: 0 })
  clicks: number;

  @Prop({ type: Date })
  lastClickedAt: Date;

  @Prop({ type: Number, default: 0 })
  order: number;

  createdAt: Date;
  updatedAt: Date;
}

export const LinkSchema = SchemaFactory.createForClass(Link);

LinkSchema.index({ category: 1, order: 1 });
