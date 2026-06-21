import { IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { transformBooleanQuery } from '../../../common/transforms/boolean-query.transform';
import { ServiceCategory } from '../../../common/taxonomy/service-categories';

export class FilterServiceDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @IsOptional()
  @Transform(({ value }) => transformBooleanQuery(value))
  @IsBoolean()
  isPublished?: boolean;
}
