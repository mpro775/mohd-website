import { IsInt, Min } from 'class-validator';

export class RestoreRevisionDto {
  @IsInt()
  @Min(1)
  expectedVersion: number;
}
