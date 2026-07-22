import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  imageMediaId?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Object, default: {} })
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImageMediaId?: Types.ObjectId;
  };

  @Prop({ type: [String], default: [] })
  previousSlugs: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ name: 1, slug: 1 });
CategorySchema.index({ isActive: 1, order: 1 });
CategorySchema.index({ previousSlugs: 1 });
CategorySchema.index({
  isActive: 1,
  deletedAt: 1,
  updatedAt: -1,
});
