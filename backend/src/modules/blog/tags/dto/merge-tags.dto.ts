import { IsMongoId } from 'class-validator';

export class MergeTagsDto {
  @IsMongoId()
  sourceTagId: string;

  @IsMongoId()
  targetTagId: string;
}
