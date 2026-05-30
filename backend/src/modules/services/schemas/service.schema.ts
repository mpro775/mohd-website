import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Service extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  detailedDescription: string;

  @Prop()
  icon: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ type: Number })
  price: number;

  @Prop()
  duration: string;

  createdAt: Date;
  updatedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

ServiceSchema.index({ order: 1 });
