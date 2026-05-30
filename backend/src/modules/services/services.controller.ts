import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Public()
@Controller(['public/services', 'services'])
export class PublicServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAll() {
    return {
      message: 'Services loaded successfully',
      data: await this.servicesService.findAll(),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Service loaded successfully',
      data: await this.servicesService.findOne(id),
    };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/services')
export class AdminServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAll() {
    return {
      message: 'Services loaded successfully',
      data: await this.servicesService.findAllAdmin(),
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
  async create(@Body() createServiceDto: CreateServiceDto) {
    return {
      message: 'Service created successfully',
      data: await this.servicesService.create(createServiceDto),
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return {
      message: 'Service updated successfully',
      data: await this.servicesService.update(id, updateServiceDto),
    };
  }

  @Patch(':id/publish')
  async publish(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Service published successfully',
      data: await this.servicesService.publish(id, true),
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Service unpublished successfully',
      data: await this.servicesService.publish(id, false),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.servicesService.remove(id);
    return { message: 'Service deleted successfully', data: null };
  }
}
