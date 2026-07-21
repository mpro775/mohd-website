import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class TrackPostViewDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sessionId?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(1000)
  referrer?: string;
}
