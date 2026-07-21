import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { EducationDegreeType } from '../../../common/taxonomy/credential-taxonomy';

export class EducationSeoDto {
  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  metaDescription?: string | null;

  @IsOptional()
  @IsMongoId()
  ogImageMediaId?: string | null;
}

export class CreateEducationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  institution: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string | null;

  @IsString()
  @MinLength(2)
  @MaxLength(180)
  degree: string;

  @IsEnum(EducationDegreeType)
  degreeType: EducationDegreeType;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  fieldOfStudy?: string | null;

  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  grade?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  location?: string | null;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  institutionUrl?: string | null;

  @IsOptional()
  @IsMongoId()
  institutionLogoMediaId?: string | null;

  @IsOptional()
  @IsMongoId()
  coverImageMediaId?: string | null;

  @IsOptional()
  @IsMongoId()
  certificateMediaId?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(180, { each: true })
  achievements?: string[];

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => EducationSeoDto)
  seo?: EducationSeoDto | null;
}
