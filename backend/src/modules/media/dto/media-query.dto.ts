import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { MediaFolder } from './upload-media.dto';

export class MediaQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(MediaFolder, {
    message: 'فلتر المجلد غير صالح',
  })
  folder?: MediaFolder;

  @IsOptional()
  @IsEnum(['image', 'document'], {
    message: 'حقل type يجب أن يكون image أو document',
  })
  type?: 'image' | 'document';

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isUsed?: boolean;
}
