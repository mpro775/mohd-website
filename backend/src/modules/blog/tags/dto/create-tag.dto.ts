import { IsString, IsOptional, IsBoolean, MinLength, Matches } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @MinLength(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' })
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, { message: 'اللون يجب أن يكون بنظام hex مثل #3b82f6' })
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
