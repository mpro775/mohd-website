import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface ISocialLink {
  platform: string;
  url: string;
}

export interface ICertificate {
  title: string;
  issuer: string;
  date: Date;
  url?: string;
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

  @Prop()
  profileImage: string;

  @Prop()
  profileImageAlt?: string;

  @Prop()
  cvFile: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  location?: string;

  @Prop({ default: true })
  availableForWork: boolean;

  @Prop({ type: [Object], default: [] })
  socialLinks: ISocialLink[];

  @Prop({ type: Number, default: 0 })
  yearsOfExperience: number;

  @Prop({ type: [Object], default: [] })
  certificates: ICertificate[];

  @Prop({ type: [String], default: [] })
  languages: string[];

  @Prop({ type: Object })
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
