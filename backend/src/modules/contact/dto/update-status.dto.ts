import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MessageStatus } from '../schemas/contact-message.schema';

export class UpdateStatusDto {
  @IsEnum(MessageStatus)
  status: MessageStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
