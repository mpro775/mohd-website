import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MediaFolder } from './upload-media.dto';

export class UpdateMediaMetadataDto {
  @IsOptional()
  @IsEnum(MediaFolder, {
    message:
      'المجلد المحدد غير صالح. المجلدات المسموحة: profile, projects, blog, services, technologies, links, cv, misc',
  })
  folder?: MediaFolder;

  @IsOptional()
  @IsString({ message: 'حقل alt يجب أن يكون نصاً' })
  alt?: string;

  @IsOptional()
  @IsString({ message: 'حقل usage يجب أن يكون نصاً' })
  usage?: string;
}
