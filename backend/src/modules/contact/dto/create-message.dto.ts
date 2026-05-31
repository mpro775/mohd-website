import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  website?: string;

  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(3)
  subject: string;

  @IsString()
  @MinLength(10)
  message: string;

  @IsOptional()
  @IsString()
  turnstileToken?: string;
}
