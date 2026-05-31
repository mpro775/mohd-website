import { Type } from 'class-transformer';
import { IsBoolean, IsInt, Min } from 'class-validator';

export class CleanupUnusedMediaDto {
  @Type(() => Number)
  @IsInt()
  @Min(7)
  olderThanDays: number;

  @IsBoolean()
  confirm: boolean;
}
