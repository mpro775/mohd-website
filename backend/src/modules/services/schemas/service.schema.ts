import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ServiceCategory } from '../../../common/taxonomy/service-categories';

export interface IServiceSEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImageMediaId?: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Service extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop()
  detailedDescription: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  iconMediaId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ServiceCategory,
    default: ServiceCategory.OTHER,
    required: true,
    trim: true,
  })
  category: ServiceCategory;

  @Prop({ type: Number })
  startingPrice: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop()
  price: string;

  @Prop()
  duration: string;

  @Prop({ type: [String], default: [] })
  deliverables: string[];

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop()
  ctaText: string;

  @Prop()
  ctaUrl: string;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Object })
  seo: IServiceSEO;

  createdAt: Date;
  updatedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

ServiceSchema.index({ order: 1 });
