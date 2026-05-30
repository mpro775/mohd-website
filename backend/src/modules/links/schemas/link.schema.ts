import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Link extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  description: string;

  @Prop()
  icon: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ type: Number, default: 0 })
  clicks: number;

  createdAt: Date;
  updatedAt: Date;
}

export const LinkSchema = SchemaFactory.createForClass(Link);

LinkSchema.index({ category: 1, order: 1 });
