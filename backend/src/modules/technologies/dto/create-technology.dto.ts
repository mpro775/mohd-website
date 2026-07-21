import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  MinLength,
  IsUrl,
} from 'class-validator';
import {
  TechnologyCategory,
  TechnologyGroup,
  ProficiencyLevel,
} from '../../../common/taxonomy/technology-taxonomy';

export class CreateTechnologyDto {
  @IsString()
  @MinLength(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' })
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  iconMediaId?: string;

  @IsOptional()
  @IsEnum(ProficiencyLevel, { message: 'مستوى الخبرة غير صالح' })
  proficiencyLevel?: ProficiencyLevel;

  @IsOptional()
  @IsEnum(TechnologyCategory, { message: 'تصنيف التقنية غير صالح' })
  category?: TechnologyCategory;

  @IsOptional()
  @IsEnum(TechnologyGroup, { message: 'مجموعة التقنية غير صالحة' })
  group?: TechnologyGroup;

  @IsOptional()
  @IsUrl({}, { message: 'الرابط الرسمي officialUrl يجب أن يكون رابطاً صالحاً' })
  officialUrl?: string;

  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;

  @IsOptional()
  @IsBoolean()
  highlighted?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}
