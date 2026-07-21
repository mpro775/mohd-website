import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CertificationType } from '../../../common/taxonomy/credential-taxonomy';

export class CertificationSeoDto {
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

export class CreateCertificationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string | null;

  @IsEnum(CertificationType)
  type: CertificationType;

  @IsString()
  @MinLength(2)
  @MaxLength(140)
  issuer: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  platform?: string | null;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  platformUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  credentialId?: string | null;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  credentialUrl?: string | null;

  @IsOptional()
  @IsDateString()
  issuedAt?: string | null;

  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @IsOptional()
  @IsBoolean()
  doesNotExpire?: boolean;

  @IsOptional()
  @IsMongoId()
  imageMediaId?: string | null;

  @IsOptional()
  @IsMongoId()
  documentMediaId?: string | null;

  @IsOptional()
  @IsMongoId()
  issuerLogoMediaId?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  language?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100000)
  durationHours?: number | null;

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
  @Type(() => CertificationSeoDto)
  seo?: CertificationSeoDto | null;
}
