import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ProjectStatus {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in-progress',
  PAUSED = 'paused',
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

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  coverImage?: string;

  @Prop({ type: [String], default: [] })
  gallery: string[];

  @Prop({ type: [String], default: [] })
  technologies: string[];

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

  @Prop({ required: true, trim: true })
  category: string;

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

  @Prop({ type: Object })
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Indexes for better performance
ProjectSchema.index({ title: 'text', shortDescription: 'text' });
ProjectSchema.index({ slug: 1 }, { unique: true });
ProjectSchema.index({ category: 1, status: 1, isPublished: 1 });
ProjectSchema.index({ order: 1 });
