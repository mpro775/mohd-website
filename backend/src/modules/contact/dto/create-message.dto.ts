import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @MinLength(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' })
  fullName: string;

  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(3, { message: 'الموضوع يجب أن يكون 3 أحرف على الأقل' })
  subject: string;

  @IsString()
  @MinLength(10, { message: 'الرسالة يجب أن تكون 10 أحرف على الأقل' })
  message: string;
}
