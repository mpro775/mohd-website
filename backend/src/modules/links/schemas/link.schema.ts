import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop()
  icon: string;

  @Prop({ trim: true })
  platform: string;

  @Prop({ trim: true })
  category: string;

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
LinkSchema.index({ slug: 1 }, { unique: true });
