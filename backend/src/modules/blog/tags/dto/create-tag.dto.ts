import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @MinLength(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' })
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
