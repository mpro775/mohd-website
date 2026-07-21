import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsMongoId,
} from 'class-validator';

export enum CertificationBulkAction {
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  FEATURE = 'feature',
  UNFEATURE = 'unfeature',
  DELETE = 'delete',
}

export class BulkCertificationActionDto {
  @IsEnum(CertificationBulkAction)
  action: CertificationBulkAction;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsMongoId({ each: true })
  ids: string[];
}
