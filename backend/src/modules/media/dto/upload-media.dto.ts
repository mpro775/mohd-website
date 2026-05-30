import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum MediaFolder {
  PROFILE = 'profile',
  PROJECTS = 'projects',
  BLOG = 'blog',
  SERVICES = 'services',
  TECHNOLOGIES = 'technologies',
  LINKS = 'links',
  CV = 'cv',
  MISC = 'misc',
}

export class UploadMediaDto {
  @IsEnum(MediaFolder, {
    message:
      'المجلد المحدد غير صالح. المجلدات المسموحة: profile, projects, blog, services, technologies, links, cv, misc',
  })
  folder: MediaFolder;

  @IsOptional()
  @IsString({ message: 'حقل alt يجب أن يكون نصاً' })
  alt?: string;

  @IsOptional()
  @IsString({ message: 'حقل usage يجب أن يكون نصاً' })
  usage?: string;
}
