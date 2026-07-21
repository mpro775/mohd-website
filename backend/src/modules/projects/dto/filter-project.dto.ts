import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import {
  ProjectCategory,
  ProjectStatus,
} from '../../../common/taxonomy/project-categories';
import { transformBooleanQuery } from '../../../common/transforms/boolean-query.transform';

export class FilterProjectDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProjectCategory)
  category?: ProjectCategory;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsString()
  technology?: string;

  @IsOptional()
  @Transform(({ value }) => transformBooleanQuery(value))
  @IsBoolean()
  isPublished?: boolean;
}
