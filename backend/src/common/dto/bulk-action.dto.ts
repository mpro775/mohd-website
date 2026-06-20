import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsObject,
} from 'class-validator';

export enum BulkAction {
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  ARCHIVE = 'archive',
  DELETE = 'delete',
}

export class BulkActionDto {
  @IsEnum(BulkAction, {
    message:
      'الإجراء الجماعي غير صالح. الإجراءات المسموحة: publish, unpublish, archive, delete',
  })
  action: BulkAction;

  @IsArray({ message: 'المعرفات يجب أن تكون مصفوفة' })
  @IsMongoId({
    each: true,
    message: 'كل معرف يجب أن يكون معرف MongoDB صالح (MongoId)',
  })
  ids: string[];

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
