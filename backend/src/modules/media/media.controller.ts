import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaQueryDto } from './dto/media-query.dto';
import { UpdateMediaMetadataDto } from './dto/update-media-metadata.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
    @Req() req: any,
  ) {
    const media = await this.mediaService.upload(file, dto, req);
    return {
      message: 'تم رفع الملف بنجاح وتحويله للصيغة المطلوبة',
      data: media,
    };
  }

  @Get()
  async findAll(@Query() query: MediaQueryDto) {
    const paginated = await this.mediaService.findAll(query);
    return {
      message: 'تم تحميل ملفات الوسائط بنجاح',
      data: paginated.data,
      meta: paginated.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const media = await this.mediaService.findOne(id);
    return {
      message: 'تم تحميل بيانات الملف بنجاح',
      data: media,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateMediaMetadataDto,
    @Req() req: any,
  ) {
    const media = await this.mediaService.updateMetadata(id, dto, req);
    return {
      message: 'تم تحديث البيانات الوصفية للملف بنجاح',
      data: media,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseObjectIdPipe) id: string, @Req() req: any) {
    await this.mediaService.remove(id, req);
    return {
      message: 'تم حذف الملف بنجاح',
      data: null,
    };
  }
}
