import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'كلمة المرور الحالية يجب أن تكون 6 أحرف على الأقل' })
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' })
  newPassword: string;
}
