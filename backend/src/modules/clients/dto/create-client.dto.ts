import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name: string;

  @IsString()
  arabicName: string;

  @IsString()
  englishName: string;

  @IsOptional()
  @IsString()
  logoMediaId?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}
