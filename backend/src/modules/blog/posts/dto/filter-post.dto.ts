import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { PostStatus } from '../schemas/post.schema';

export class FilterPostDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  tagSlug?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
