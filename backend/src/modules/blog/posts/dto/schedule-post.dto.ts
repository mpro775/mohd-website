import { IsDateString, IsInt, IsString, Min } from 'class-validator';

export class SchedulePostDto {
  @IsDateString()
  scheduledAt: string;

  @IsString()
  sourceTimezone: string;

  @IsInt()
  @Min(1)
  expectedVersion: number;
}
