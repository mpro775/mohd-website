import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectCategory, ProjectStatus } from '../../../common/taxonomy/project-categories';

class SeoDto {
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  ogImageMediaId?: string;
}

export class CreateProjectDto {
  @IsString()
  @MinLength(3, { message: 'العنوان يجب أن يكون 3 أحرف على الأقل' })
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @MinLength(10, { message: 'الوصف القصير يجب أن يكون 10 أحرف على الأقل' })
  shortDescription: string;

  @IsString()
  @MinLength(20, { message: 'الوصف التفصيلي يجب أن يكون 20 حرف على الأقل' })
  detailedDescription: string;

  @IsOptional()
  @IsString()
  coverImageMediaId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryMediaIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologySlugs?: string[];

  @IsOptional()
  @IsString()
  liveUrl?: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;

  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @IsOptional()
  @IsEnum(ProjectStatus, { message: 'حالة المشروع غير صالحة' })
  status?: ProjectStatus;

  @IsEnum(ProjectCategory, { message: 'تصنيف المشروع غير صالح' })
  category: ProjectCategory;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsString()
  caseStudy?: string;

  @IsOptional()
  @IsString()
  problem?: string;

  @IsOptional()
  @IsString()
  solution?: string;

  @IsOptional()
  @IsString()
  results?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;
}
