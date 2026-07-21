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

export class ReorderCertificationItemDto {
  @IsMongoId()
  id: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderCertificationsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => ReorderCertificationItemDto)
  items: ReorderCertificationItemDto[];
}
