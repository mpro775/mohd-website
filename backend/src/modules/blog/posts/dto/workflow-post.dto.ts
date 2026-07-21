import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class WorkflowPostDto {
  @IsInt()
  @Min(1)
  expectedVersion: number;
}

export class SubmitReviewDto extends WorkflowPostDto {}

export class PublishPostDto extends WorkflowPostDto {}

export class RequestChangesDto extends WorkflowPostDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}

export class PermanentDeletePostDto {
  @IsString()
  confirmation: string;
}
