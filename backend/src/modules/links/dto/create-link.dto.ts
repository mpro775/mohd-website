import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  IsUrl,
} from 'class-validator';

export class CreateLinkDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsUrl({}, { message: 'الرابط غير صالح' })
  url: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
