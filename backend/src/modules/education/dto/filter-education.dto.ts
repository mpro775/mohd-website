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
import { EducationDegreeType } from '../../../common/taxonomy/credential-taxonomy';

export class FilterEducationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(EducationDegreeType)
  degreeType?: EducationDegreeType;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2200)
  startYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2200)
  endYear?: number;

  @IsOptional()
  @Transform(({ value }) => transformBooleanQuery(value))
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @Transform(({ value }) => transformBooleanQuery(value))
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @Transform(({ value }) => transformBooleanQuery(value))
  @IsBoolean()
  isFeatured?: boolean;
}
