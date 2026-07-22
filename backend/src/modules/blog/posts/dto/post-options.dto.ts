import { IsOptional, IsEnum, IsArray, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { PostStatus } from '../schemas/post.schema';

export class PostOptionsDto extends PaginationDto {
  @IsOptional()
  @IsMongoId()
  excludeId?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? value : String(value).split(',').filter(Boolean),
  )
  @IsArray()
  @IsMongoId({ each: true })
  ids?: string[];
}
