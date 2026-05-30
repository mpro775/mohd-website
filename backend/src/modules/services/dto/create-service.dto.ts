import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MinLength(3, { message: 'الاسم يجب أن يكون 3 أحرف على الأقل' })
  name: string;

  @IsString()
  @MinLength(10, { message: 'الوصف القصير يجب أن يكون 10 أحرف على الأقل' })
  shortDescription: string;

  @IsString()
  @MinLength(20, { message: 'الوصف التفصيلي يجب أن يكون 20 حرف على الأقل' })
  detailedDescription: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  duration?: string;
}
