import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsDateString,
  MinLength,
  ValidateNested,
  IsBoolean,
  IsUrl,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PostStatus } from '../schemas/post.schema';

class SEODto {
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;
}

export class CreatePostDto {
  @IsString()
  @MinLength(3, { message: 'العنوان يجب أن يكون 3 أحرف على الأقل' })
  title: string;

  @IsString()
  @MinLength(20, { message: 'الملخص يجب أن يكون 20 حرف على الأقل' })
  summary: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  @MinLength(50, { message: 'المحتوى يجب أن يكون 50 حرف على الأقل' })
  content: string;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsMongoId()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  tags?: string[];

  @IsOptional()
  @IsDateString()
  publishDate?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsNumber()
  readTime?: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  allowIndexing?: boolean;

  @IsOptional()
  @IsUrl(
    {},
    { message: 'الرابط الأساسي canonicalUrl يجب أن يكون رابطاً صالحاً' },
  )
  canonicalUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SEODto)
  seo?: SEODto;
}
