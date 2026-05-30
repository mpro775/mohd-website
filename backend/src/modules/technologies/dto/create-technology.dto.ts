import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  MinLength,
} from 'class-validator';
import { ProficiencyLevel } from '../schemas/technology.schema';

export class CreateTechnologyDto {
  @IsString()
  @MinLength(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' })
  name: string;

  @IsString()
  @MinLength(5, { message: 'الوصف يجب أن يكون 5 أحرف على الأقل' })
  description: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsEnum(ProficiencyLevel)
  proficiencyLevel?: ProficiencyLevel;

  @IsString()
  @MinLength(2)
  category: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
