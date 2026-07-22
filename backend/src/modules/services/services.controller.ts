import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permission } from '../../common/auth/permissions.enum';
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
  UseGuards,
  Request,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { FilterServiceDto } from './dto/filter-service.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { MediaService } from '../media/media.service';
import {
  mapServiceToPublic,
  mapServiceToAdmin,
} from './mappers/service.mapper';

@Public()
@Controller('public/services')
export class PublicServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    const rawList = await this.servicesService.findAll(category);
    const mappedList = await Promise.all(
      rawList.map((item) => mapServiceToPublic(item, this.mediaService)),
    );
    return {
      message: 'Services loaded successfully',
      data: mappedList,
    };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const raw = await this.servicesService.findOne(slug);
    const mapped = await mapServiceToPublic(raw, this.mediaService);
    return {
      message: 'Service loaded successfully',
      data: mapped,
    };
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Permission.MANAGE_PORTFOLIO)
@Controller('admin/services')
export class AdminServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(@Query() query: FilterServiceDto) {
    const result = await this.servicesService.findAllAdmin(query);
    const mappedData = await Promise.all(
      result.data.map((item) => mapServiceToAdmin(item, this.mediaService)),
    );
    return {
      message: 'Services loaded successfully',
      data: mappedData,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.servicesService.findOneAdmin(id);
    const mapped = await mapServiceToAdmin(raw, this.mediaService);
    return {
      message: 'Service loaded successfully',
      data: mapped,
    };
  }

  @Post()
  async create(@Request() req, @Body() createServiceDto: CreateServiceDto) {
    const raw = await this.servicesService.create(createServiceDto, req);
    const mapped = await mapServiceToAdmin(raw, this.mediaService);
    return {
      message: 'Service created successfully',
      data: mapped,
    };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    const raw = await this.servicesService.update(id, updateServiceDto, req);
    const mapped = await mapServiceToAdmin(raw, this.mediaService);
    return {
      message: 'Service updated successfully',
      data: mapped,
    };
  }

  @Patch(':id/publish')
  async publish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.servicesService.publish(id, true, req);
    const mapped = await mapServiceToAdmin(raw, this.mediaService);
    return {
      message: 'Service published successfully',
      data: mapped,
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.servicesService.publish(id, false, req);
    const mapped = await mapServiceToAdmin(raw, this.mediaService);
    return {
      message: 'Service unpublished successfully',
      data: mapped,
    };
  }

  @Patch('reorder')
  async reorder(
    @Request() req,
    @Body() body: { items: { id: string; order: number }[] },
  ) {
    await this.servicesService.reorder(body.items || [], req);
    return { message: 'Services reordered successfully', data: null };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    await this.servicesService.remove(id, req);
    return { message: 'Service deleted successfully', data: null };
  }
}
