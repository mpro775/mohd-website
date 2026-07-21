import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  TechnologyCategory,
  TechnologyGroup,
  ProficiencyLevel,
} from '../../../common/taxonomy/technology-taxonomy';

export { TechnologyCategory, TechnologyGroup, ProficiencyLevel };

@Schema({ timestamps: true })
export class Technology extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  iconMediaId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ProficiencyLevel,
    default: ProficiencyLevel.INTERMEDIATE,
  })
  proficiencyLevel: ProficiencyLevel;

  @Prop({
    type: String,
    enum: TechnologyCategory,
    default: TechnologyCategory.OTHER,
    trim: true,
  })
  category: TechnologyCategory;

  @Prop({
    type: String,
    enum: TechnologyGroup,
    default: TechnologyGroup.OTHER,
    trim: true,
  })
  group: TechnologyGroup;

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
