import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class PostSeoDto {
  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  metaDescription?: string;

  @IsOptional()
  @IsMongoId()
  ogImageMediaId?: string;
}

export class CreatePostDraftDto {
  @IsString()
  @MaxLength(180)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @IsString()
  @MaxLength(500)
  summary: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsMongoId()
  featuredImageMediaId?: string;

  @IsOptional()
  @IsMongoId()
  coverImageMediaId?: string;

  @IsOptional()
  @IsMongoId()
  category?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  relatedPostIds?: string[];

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  featuredOrder?: number;

  @IsOptional()
  @IsBoolean()
  allowIndexing?: boolean;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  canonicalUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PostSeoDto)
  seo?: PostSeoDto;
}

/** Compatibility name for existing imports; it intentionally contains no workflow fields. */
export class CreatePostDto extends CreatePostDraftDto {}
