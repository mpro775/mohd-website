import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsMongoId,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReorderEducationItemDto {
  @IsMongoId()
  id: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderEducationDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => ReorderEducationItemDto)
  items: ReorderEducationItemDto[];
}
