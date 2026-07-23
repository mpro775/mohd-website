import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Client extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  arabicName: string;

  @Prop({ required: true, trim: true })
  englishName: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  logoMediaId?: Types.ObjectId;

  @Prop()
  url?: string;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ default: 0 })
  order: number;

  createdAt: Date;
  updatedAt: Date;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
