import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface FaqSeo {
  metaTitle?: string;
  metaDescription?: string;
}

@Schema({ timestamps: true })
export class Faq extends Document {
  @Prop({ required: true, trim: true })
  question: string;

  @Prop({ required: true })
  answer: string;

  @Prop({ trim: true })
  category?: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Boolean, default: false })
  isPublished: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Object })
  seo?: FaqSeo;

  createdAt: Date;
  updatedAt: Date;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);

FaqSchema.index({ question: 'text', answer: 'text', category: 'text' });
FaqSchema.index({ isPublished: 1, order: 1 });
FaqSchema.index({ category: 1, isPublished: 1 });
