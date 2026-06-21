import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProjectCategory, ProjectStatus } from '../../../common/taxonomy/project-categories';

export { ProjectCategory, ProjectStatus };

@Schema({ _id: false })
export class ProjectSeo {
  @Prop()
  metaTitle?: string;

  @Prop()
  metaDescription?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  ogImageMediaId?: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  detailedDescription: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  coverImageMediaId?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Media' }], default: [] })
  galleryMediaIds: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  technologySlugs: string[];

  @Prop()
  liveUrl: string;

  @Prop()
  githubUrl: string;

  @Prop({ type: Date })
  completionDate: Date;

  @Prop({
    type: String,
    enum: ProjectStatus,
    default: ProjectStatus.COMPLETED,
  })
  status: ProjectStatus;

  @Prop({ type: String, enum: ProjectCategory, default: ProjectCategory.OTHER, required: true, trim: true })
  category: ProjectCategory;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ default: false })
  featured: boolean;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop()
  caseStudy?: string;

  @Prop()
  problem?: string;

  @Prop()
  solution?: string;

  @Prop()
  results?: string;

  @Prop()
  role?: string;

  @Prop()
  clientName?: string;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({ type: SchemaFactory.createForClass(ProjectSeo), default: {} })
  seo?: ProjectSeo;

  @Prop({ type: Number, default: 0 })
  views: number;

  createdAt: Date;
  updatedAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ title: 'text', shortDescription: 'text' });
ProjectSchema.index({ category: 1, status: 1, isPublished: 1 });
ProjectSchema.index({ order: 1 });
