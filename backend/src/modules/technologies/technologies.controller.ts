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
import { TechnologiesService } from './technologies.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Public()
@Controller('public/technologies')
export class PublicTechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    return {
      message: 'Technologies loaded successfully',
      data: await this.technologiesService.findAll(category),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Technology loaded successfully',
      data: await this.technologiesService.findOne(id),
    };
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/technologies')
export class AdminTechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    return {
      message: 'Technologies loaded successfully',
      data: await this.technologiesService.findAllAdmin(category),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Technology loaded successfully',
      data: await this.technologiesService.findOneAdmin(id),
    };
  }

  @Post()
  async create(
    @Request() req,
    @Body() createTechnologyDto: CreateTechnologyDto,
  ) {
    return {
      message: 'Technology created successfully',
      data: await this.technologiesService.create(createTechnologyDto, req),
    };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateTechnologyDto: UpdateTechnologyDto,
  ) {
    return {
      message: 'Technology updated successfully',
      data: await this.technologiesService.update(id, updateTechnologyDto, req),
    };
  }

  @Patch(':id/publish')
  async publish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Technology published successfully',
      data: await this.technologiesService.publish(id, true, req),
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Technology unpublished successfully',
      data: await this.technologiesService.publish(id, false, req),
    };
  }

  @Patch('reorder')
  async reorder(
    @Request() req,
    @Body() body: { items: { id: string; order: number }[] },
  ) {
    await this.technologiesService.reorder(body.items || [], req);
    return { message: 'Technologies reordered successfully', data: null };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    await this.technologiesService.remove(id, req);
    return { message: 'Technology deleted successfully', data: null };
  }
}
