import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ProficiencyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Schema({ timestamps: true })
export class Technology extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop()
  description: string;

  @Prop()
  icon: string;

  @Prop({
    type: String,
    enum: ProficiencyLevel,
    default: ProficiencyLevel.INTERMEDIATE,
  })
  proficiencyLevel: ProficiencyLevel;

  @Prop({ trim: true })
  category: string;

  @Prop({ trim: true })
  group: string;

  @Prop()
  officialUrl: string;

  @Prop({ type: Number })
  yearsOfExperience: number;

  @Prop({ default: false })
  highlighted: boolean;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop()
  color: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  createdAt: Date;
  updatedAt: Date;
}

export const TechnologySchema = SchemaFactory.createForClass(Technology);

TechnologySchema.index({ category: 1, order: 1 });
