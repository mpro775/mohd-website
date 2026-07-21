import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { CreatePostDraftDto } from './create-post.dto';

export class UpdatePostContentDto extends PartialType(CreatePostDraftDto) {
  @IsInt()
  @Min(1)
  expectedVersion: number;

  @IsOptional()
  @IsEnum(['manual_save', 'autosave'])
  saveReason?: 'manual_save' | 'autosave';
}

export class AutosavePostDto extends UpdatePostContentDto {
  saveReason = 'autosave' as const;
}

/** Compatibility name for existing imports; status and publication dates are forbidden. */
export class UpdatePostDto extends UpdatePostContentDto {}
