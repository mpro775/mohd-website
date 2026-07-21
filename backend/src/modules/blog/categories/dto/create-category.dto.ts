import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  IsInt,
  Min,
  IsMongoId,
  ValidateNested,
} from 'class-validator';

class CategorySeoDto {
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
  @IsOptional() @IsMongoId() ogImageMediaId?: string;
}

export class CreateCategoryDto {
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
  @IsMongoId()
  imageMediaId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CategorySeoDto)
  seo?: CategorySeoDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
