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
@Roles(UserRole.ADMIN, UserRole.EDITOR)
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
    return {
      message: 'Media uploaded successfully',
      data: await this.mediaService.upload(file, dto, req),
    };
  }

  @Get()
  async findAll(@Query() query: MediaQueryDto) {
    const paginated = await this.mediaService.findAll(query);
    return {
      message: 'Media loaded successfully',
      data: paginated.data,
      meta: paginated.meta,
    };
  }

  @Get('cleanup/unused')
  @Roles(UserRole.ADMIN)
  async cleanupUnused(
    @Query('dryRun') dryRun = 'true',
    @Query('olderThanDays') olderThanDays = '30',
    @Req() req: any,
  ) {
    return {
      message: 'Unused media cleanup inspected successfully',
      data: await this.mediaService.cleanupUnused(
        dryRun !== 'false',
        Number(olderThanDays) || 30,
        req,
      ),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Media loaded successfully',
      data: await this.mediaService.findOne(id),
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateMediaMetadataDto,
    @Req() req: any,
  ) {
    return {
      message: 'Media metadata updated successfully',
      data: await this.mediaService.updateMetadata(id, dto, req),
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseObjectIdPipe) id: string, @Req() req: any) {
    await this.mediaService.remove(id, req);
    return {
      message: 'Media deleted successfully',
      data: null,
    };
  }
}
