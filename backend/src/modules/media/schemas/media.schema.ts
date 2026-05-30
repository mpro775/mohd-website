import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Media extends Document {
  @Prop({ required: true, trim: true })
  filename: string;

  @Prop({ required: true, trim: true })
  originalName: string;

  @Prop({ required: true, unique: true, index: true })
  key: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true, enum: ['r2'], default: 'r2' })
  provider: 'r2';

  @Prop({
    required: true,
    enum: [
      'profile',
      'projects',
      'blog',
      'services',
      'technologies',
      'links',
      'cv',
      'misc',
    ],
  })
  folder:
    | 'profile'
    | 'projects'
    | 'blog'
    | 'services'
    | 'technologies'
    | 'links'
    | 'cv'
    | 'misc';

  @Prop({ required: true, enum: ['image', 'document'] })
  type: 'image' | 'document';

  @Prop()
  width?: number;

  @Prop()
  height?: number;

  @Prop()
  alt?: string;

  @Prop()
  usage?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploadedBy?: Types.ObjectId;

  @Prop({ required: true, default: false })
  isUsed: boolean;

  @Prop({
    type: [
      {
        resourceType: { type: String, required: true },
        resourceId: { type: String, required: true },
        field: { type: String, required: true },
        _id: false,
      },
    ],
    default: [],
  })
  usedIn: {
    resourceType: string;
    resourceId: string;
    field: string;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
MediaSchema.index({ key: 1 }, { unique: true });
MediaSchema.index({ folder: 1 });
MediaSchema.index({ isUsed: 1 });
MediaSchema.index({ type: 1 });
