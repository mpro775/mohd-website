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

  @Prop({ required: true })
  description: string;

  @Prop()
  icon: string;

  @Prop({
    type: String,
    enum: ProficiencyLevel,
    default: ProficiencyLevel.INTERMEDIATE,
  })
  proficiencyLevel: ProficiencyLevel;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ default: true })
  isPublished: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const TechnologySchema = SchemaFactory.createForClass(Technology);

TechnologySchema.index({ category: 1, order: 1 });
