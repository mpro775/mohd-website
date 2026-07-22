import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Tag extends Document {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ default: '#3b82f6', trim: true })
  color: string;

  @Prop()
  description?: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Object, default: {} })
  seo?: { metaTitle?: string; metaDescription?: string };

  @Prop({ type: [String], default: [] })
  previousSlugs: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

TagSchema.index({ name: 1, slug: 1 });
TagSchema.index({ isActive: 1, order: 1 });
TagSchema.index({ previousSlugs: 1 });
TagSchema.index({
  isActive: 1,
  deletedAt: 1,
  updatedAt: -1,
});
