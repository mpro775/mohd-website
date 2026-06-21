import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class Language {
  @Prop({ required: true })
  name: string;

  @Prop()
  level?: string;
}

@Schema({ _id: false })
export class Certificate {
  @Prop({ required: true })
  title: string;

  @Prop()
  issuer?: string;

  @Prop({ type: Date })
  date?: Date;

  @Prop()
  url?: string;
}

@Schema({ _id: false })
export class ProfileSeo {
  @Prop()
  metaTitle?: string;

  @Prop()
  metaDescription?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  ogImageMediaId?: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  headline?: string;

  @Prop({ required: true })
  bio: string;

  @Prop()
  about?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  profileImageMediaId?: Types.ObjectId;

  @Prop()
  profileImageAlt?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  cvMediaId?: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  location?: string;

  @Prop({ default: true })
  availableForWork: boolean;

  @Prop({ type: [SchemaFactory.createForClass(Language)], default: [] })
  languages: Language[];

  @Prop({ type: Number, default: 0 })
  yearsOfExperience?: number;

  @Prop({ type: [SchemaFactory.createForClass(Certificate)], default: [] })
  certificates: Certificate[];

  @Prop({ type: SchemaFactory.createForClass(ProfileSeo), default: {} })
  seo: ProfileSeo;

  createdAt: Date;
  updatedAt: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
