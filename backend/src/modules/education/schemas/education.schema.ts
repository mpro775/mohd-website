import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EducationDegreeType } from '../../../common/taxonomy/credential-taxonomy';

@Schema({ _id: false })
export class EducationSeo {
  @Prop({ trim: true, maxlength: 70 })
  metaTitle?: string;

  @Prop({ trim: true, maxlength: 180 })
  metaDescription?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  ogImageMediaId?: Types.ObjectId;
}

@Schema({ timestamps: true, collection: 'educations' })
export class Education extends Document {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 180 })
  institution: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 180 })
  degree: string;

  @Prop({
    required: true,
    type: String,
    enum: EducationDegreeType,
    default: EducationDegreeType.OTHER,
  })
  degreeType: EducationDegreeType;

  @Prop({ trim: true, maxlength: 180 })
  fieldOfStudy?: string;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ default: false })
  isCurrent: boolean;

  @Prop({ trim: true, maxlength: 100 })
  grade?: string;

  @Prop({ trim: true, maxlength: 5000 })
  description?: string;

  @Prop({ trim: true, maxlength: 180 })
  location?: string;

  @Prop({ trim: true })
  institutionUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  institutionLogoMediaId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  coverImageMediaId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  certificateMediaId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  achievements: string[];

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ type: Number, min: 0, default: 0 })
  order: number;

  @Prop({ type: SchemaFactory.createForClass(EducationSeo), default: {} })
  seo: EducationSeo;

  createdAt: Date;
  updatedAt: Date;
}

export const EducationSchema = SchemaFactory.createForClass(Education);

EducationSchema.index({ isPublished: 1, isFeatured: 1, order: 1 });
EducationSchema.index({ isPublished: 1, degreeType: 1, order: 1 });
EducationSchema.index({ startDate: -1, endDate: -1 });
EducationSchema.index({
  institution: 'text',
  degree: 'text',
  fieldOfStudy: 'text',
  description: 'text',
  location: 'text',
  achievements: 'text',
});
