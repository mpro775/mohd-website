import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Media extends Document {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true, enum: ['image', 'document'] })
  type: 'image' | 'document';

  @Prop()
  width?: number;

  @Prop()
  height?: number;

  createdAt: Date;
  updatedAt: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
MediaSchema.index({ key: 1 }, { unique: true });
