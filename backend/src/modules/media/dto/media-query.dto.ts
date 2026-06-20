import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { MediaFolder } from './upload-media.dto';
import { transformBooleanQuery } from '../../../common/transforms/boolean-query.transform';

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
  @Transform(({ value }) => transformBooleanQuery(value))
  @IsBoolean()
  isUsed?: boolean;
}
