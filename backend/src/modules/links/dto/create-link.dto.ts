import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  IsUrl,
  IsEnum,
} from 'class-validator';
import {
  LinkCategory,
  LinkPlatform,
} from '../../../common/taxonomy/link-taxonomy';

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
  iconMediaId?: string;

  @IsOptional()
  @IsEnum(LinkPlatform, { message: 'منصة الرابط غير صالحة' })
  platform?: LinkPlatform;

  @IsOptional()
  @IsEnum(LinkCategory, { message: 'تصنيف الرابط غير صالح' })
  category?: LinkCategory;

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
