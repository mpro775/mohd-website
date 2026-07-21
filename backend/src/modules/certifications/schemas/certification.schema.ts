import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CertificationType } from '../../../common/taxonomy/credential-taxonomy';

@Schema({ _id: false })
export class CertificationSeo {
  @Prop({ trim: true, maxlength: 70 })
  metaTitle?: string;

  @Prop({ trim: true, maxlength: 180 })
  metaDescription?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  ogImageMediaId?: Types.ObjectId;
}

@Schema({ timestamps: true, collection: 'certifications' })
export class Certification extends Document {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 160 })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({
    required: true,
    type: String,
    enum: CertificationType,
    default: CertificationType.COURSE,
  })
  type: CertificationType;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 140 })
  issuer: string;

  @Prop({ trim: true, maxlength: 140 })
  platform?: string;

  @Prop({ trim: true })
  platformUrl?: string;

  @Prop({ trim: true, maxlength: 4000 })
  description?: string;

  @Prop({ trim: true, maxlength: 250 })
  credentialId?: string;

  @Prop({ trim: true })
  credentialUrl?: string;

  @Prop({ type: Date })
  issuedAt?: Date;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ default: true })
  doesNotExpire: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  imageMediaId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  documentMediaId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  issuerLogoMediaId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ trim: true, maxlength: 100 })
  category?: string;

  @Prop({ trim: true, maxlength: 60 })
  language?: string;

  @Prop({ type: Number, min: 0, max: 100000 })
  durationHours?: number;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ type: Number, min: 0, default: 0 })
  order: number;

  @Prop({ type: SchemaFactory.createForClass(CertificationSeo), default: {} })
  seo: CertificationSeo;

  createdAt: Date;
  updatedAt: Date;
}

export const CertificationSchema = SchemaFactory.createForClass(Certification);

CertificationSchema.index({ isPublished: 1, isFeatured: 1, order: 1 });
CertificationSchema.index({ isPublished: 1, type: 1, order: 1 });
CertificationSchema.index({ platform: 1, isPublished: 1 });
CertificationSchema.index({ issuer: 1, isPublished: 1 });
CertificationSchema.index({ issuedAt: -1 });
CertificationSchema.index({ createdAt: -1 });
CertificationSchema.index({
  title: 'text',
  issuer: 'text',
  platform: 'text',
  description: 'text',
  credentialId: 'text',
  skills: 'text',
});
