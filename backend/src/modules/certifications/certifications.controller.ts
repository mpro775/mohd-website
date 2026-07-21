import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { MediaService } from '../media/media.service';
import { UserRole } from '../users/schemas/user.schema';
import { BulkCertificationActionDto } from './dto/bulk-certification-action.dto';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { FilterCertificationDto } from './dto/filter-certification.dto';
import { ReorderCertificationsDto } from './dto/reorder-certifications.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import {
  mapCertificationToAdmin,
  mapCertificationToPublic,
  mapCertificationsToAdmin,
  mapCertificationsToPublic,
} from './mappers/certification.mapper';
import { CertificationsService } from './certifications.service';

@Public()
@Controller('public/certifications')
export class PublicCertificationsController {
  constructor(
    private readonly service: CertificationsService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(@Query() query: FilterCertificationDto) {
    const result = await this.service.findAllPublic(query);
    return {
      message: 'Certifications loaded successfully',
      data: await mapCertificationsToPublic(result.data, this.mediaService),
      meta: result.meta,
    };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const item = await this.service.findOnePublic(slug);
    return {
      message: 'Certification loaded successfully',
      data: await mapCertificationToPublic(item, this.mediaService),
    };
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
@Controller('admin/certifications')
export class AdminCertificationsController {
  constructor(
    private readonly service: CertificationsService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(@Query() query: FilterCertificationDto) {
    const result = await this.service.findAllAdmin(query);
    return {
      message: 'Certifications loaded successfully',
      data: await mapCertificationsToAdmin(result.data, this.mediaService),
      meta: result.meta,
    };
  }

  @Post()
  async create(
    @Request() request: unknown,
    @Body() dto: CreateCertificationDto,
  ) {
    const item = await this.service.create(dto, request);
    return {
      message: 'Certification created successfully',
      data: await mapCertificationToAdmin(item, this.mediaService),
    };
  }

  @Patch('reorder')
  async reorder(
    @Request() request: unknown,
    @Body() dto: ReorderCertificationsDto,
  ) {
    return {
      message: 'Certifications reordered successfully',
      data: await this.service.reorder(dto, request),
    };
  }

  @Post('bulk')
  async bulk(
    @Request() request: unknown,
    @Body() dto: BulkCertificationActionDto,
  ) {
    return {
      message: 'Certification bulk action completed successfully',
      data: await this.service.bulkAction(dto, request),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const item = await this.service.findOneAdmin(id);
    return {
      message: 'Certification loaded successfully',
      data: await mapCertificationToAdmin(item, this.mediaService),
    };
  }

  @Put(':id')
  async update(
    @Request() request: unknown,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateCertificationDto,
  ) {
    const item = await this.service.update(id, dto, request);
    return {
      message: 'Certification updated successfully',
      data: await mapCertificationToAdmin(item, this.mediaService),
    };
  }

  @Patch(':id/publish')
  async publish(
    @Request() request: unknown,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    const item = await this.service.setPublished(id, true, request);
    return {
      message: 'Certification published successfully',
      data: await mapCertificationToAdmin(item, this.mediaService),
    };
  }

  @Patch(':id/unpublish')
  async unpublish(
    @Request() request: unknown,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    const item = await this.service.setPublished(id, false, request);
    return {
      message: 'Certification unpublished successfully',
      data: await mapCertificationToAdmin(item, this.mediaService),
    };
  }

  @Patch(':id/feature')
  async feature(
    @Request() request: unknown,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    const item = await this.service.setFeatured(id, true, request);
    return {
      message: 'Certification featured successfully',
      data: await mapCertificationToAdmin(item, this.mediaService),
    };
  }

  @Patch(':id/unfeature')
  async unfeature(
    @Request() request: unknown,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    const item = await this.service.setFeatured(id, false, request);
    return {
      message: 'Certification unfeatured successfully',
      data: await mapCertificationToAdmin(item, this.mediaService),
    };
  }

  @Delete(':id')
  async remove(
    @Request() request: unknown,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    await this.service.remove(id, request);
    return { message: 'Certification deleted successfully', data: null };
  }
}
