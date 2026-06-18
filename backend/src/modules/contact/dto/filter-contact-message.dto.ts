import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { MessageStatus } from '../schemas/contact-message.schema';

export class FilterContactMessageDto extends PaginationDto {
  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;
}
