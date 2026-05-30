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

  @IsUrl({}, { message: 'الرابط غير صالح' })
  url: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  @MinLength(2)
  category: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
