import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  Min,
  IsArray,
  IsUrl,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceCategory } from '../../../common/taxonomy/service-categories';

class ServiceSEODto {
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

export class CreateServiceDto {
  @IsString()
  @MinLength(3, { message: 'الاسم يجب أن يكون 3 أحرف على الأقل' })
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @MinLength(10, { message: 'الوصف القصير يجب أن يكون 10 أحرف على الأقل' })
  shortDescription: string;

  @IsOptional()
  @IsString()
  detailedDescription?: string;

  @IsOptional()
  @IsString()
  iconMediaId?: string;

  @IsEnum(ServiceCategory, { message: 'تصنيف الخدمة غير صالح' })
  category: ServiceCategory;

  @IsOptional()
  @IsNumber()
  @Min(0)
  startingPrice?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliverables?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsOptional()
  @IsString()
  ctaText?: string;

  @IsOptional()
  @IsUrl({}, { message: 'رابط الزر ctaUrl يجب أن يكون رابطاً صالحاً' })
  ctaUrl?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceSEODto)
  seo?: ServiceSEODto;
}
