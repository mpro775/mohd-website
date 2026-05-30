import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsDateString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PostStatus } from '../schemas/post.schema';

class SEODto {
  @IsString()
  metaTitle: string;

  @IsString()
  metaDescription: string;
}

export class CreatePostDto {
  @IsString()
  @MinLength(3, { message: 'العنوان يجب أن يكون 3 أحرف على الأقل' })
  title: string;

  @IsString()
  @MinLength(20, { message: 'الملخص يجب أن يكون 20 حرف على الأقل' })
  summary: string;

  @IsString()
  @MinLength(50, { message: 'المحتوى يجب أن يكون 50 حرف على الأقل' })
  content: string;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsDateString()
  publishDate?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsNumber()
  readTime?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => SEODto)
  seo?: SEODto;
}
