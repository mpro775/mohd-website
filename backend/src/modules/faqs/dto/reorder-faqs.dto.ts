import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsMongoId,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReorderFaqItemDto {
  @IsMongoId()
  id: string;

  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderFaqsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderFaqItemDto)
  items: ReorderFaqItemDto[];
}
