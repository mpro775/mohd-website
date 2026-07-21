import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsMongoId,
} from 'class-validator';

export enum EducationBulkAction {
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  FEATURE = 'feature',
  UNFEATURE = 'unfeature',
  DELETE = 'delete',
}

export class BulkEducationActionDto {
  @IsEnum(EducationBulkAction)
  action: EducationBulkAction;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsMongoId({ each: true })
  ids: string[];
}
