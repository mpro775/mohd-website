import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { transformBooleanQuery } from '../../../common/transforms/boolean-query.transform';
import { CertificationType } from '../../../common/taxonomy/credential-taxonomy';

export class FilterCertificationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(CertificationType)
  type?: CertificationType;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  issuer?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2200)
  year?: number;

  @IsOptional()
  @Transform(({ value }) => transformBooleanQuery(value))
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @Transform(({ value }) => transformBooleanQuery(value))
  @IsBoolean()
  isFeatured?: boolean;
}
