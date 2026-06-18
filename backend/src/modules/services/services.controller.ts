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
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Public()
@Controller('public/services')
export class PublicServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAll() {
    return {
      message: 'Services loaded successfully',
      data: await this.servicesService.findAll(),
    };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return {
      message: 'Service loaded successfully',
      data: await this.servicesService.findOne(slug),
    };
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
@Controller('admin/services')
export class AdminServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAll(@Query() query: FilterServiceDto) {
    const result = await this.servicesService.findAllAdmin(query);
    return {
      message: 'Services loaded successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Service loaded successfully',
      data: await this.servicesService.findOneAdmin(id),
    };
  }

  @Post()
  async create(@Request() req, @Body() createServiceDto: CreateServiceDto) {
    return {
      message: 'Service created successfully',
      data: await this.servicesService.create(createServiceDto, req),
    };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return {
      message: 'Service updated successfully',
      data: await this.servicesService.update(id, updateServiceDto, req),
    };
  }

  @Patch(':id/publish')
  async publish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Service published successfully',
      data: await this.servicesService.publish(id, true, req),
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Service unpublished successfully',
      data: await this.servicesService.publish(id, false, req),
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
