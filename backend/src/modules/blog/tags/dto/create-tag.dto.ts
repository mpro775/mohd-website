import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  Matches,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

class TagSeoDto {
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
}

export class CreateTagDto {
  @IsString()
  @MinLength(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' })
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
    message: 'اللون يجب أن يكون بنظام hex مثل #3b82f6',
  })
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => TagSeoDto)
  seo?: TagSeoDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
