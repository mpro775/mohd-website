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
import { TechnologiesService } from './technologies.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { FilterTechnologyDto } from './dto/filter-technology.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { MediaService } from '../media/media.service';
import {
  mapTechnologyToPublic,
  mapTechnologyToAdmin,
} from './mappers/technology.mapper';

@Public()
@Controller('public/technologies')
export class PublicTechnologiesController {
  constructor(
    private readonly technologiesService: TechnologiesService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    const rawList = await this.technologiesService.findAll(category);
    const mappedList = await Promise.all(
      rawList.map((item) => mapTechnologyToPublic(item, this.mediaService)),
    );
    return {
      message: 'Technologies loaded successfully',
      data: mappedList,
    };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const raw = await this.technologiesService.findOne(slug);
    const mapped = await mapTechnologyToPublic(raw, this.mediaService);
    return {
      message: 'Technology loaded successfully',
      data: mapped,
    };
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Permission.MANAGE_PORTFOLIO)
@Controller('admin/technologies')
export class AdminTechnologiesController {
  constructor(
    private readonly technologiesService: TechnologiesService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(@Query() query: FilterTechnologyDto) {
    const result = await this.technologiesService.findAllAdmin(query);
    const mappedData = await Promise.all(
      result.data.map((item) => mapTechnologyToAdmin(item, this.mediaService)),
    );
    return {
      message: 'Technologies loaded successfully',
      data: mappedData,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.technologiesService.findOneAdmin(id);
    const mapped = await mapTechnologyToAdmin(raw, this.mediaService);
    return {
      message: 'Technology loaded successfully',
      data: mapped,
    };
  }

  @Post()
  async create(
    @Request() req,
    @Body() createTechnologyDto: CreateTechnologyDto,
  ) {
    const raw = await this.technologiesService.create(createTechnologyDto, req);
    const mapped = await mapTechnologyToAdmin(raw, this.mediaService);
    return {
      message: 'Technology created successfully',
      data: mapped,
    };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateTechnologyDto: UpdateTechnologyDto,
  ) {
    const raw = await this.technologiesService.update(
      id,
      updateTechnologyDto,
      req,
    );
    const mapped = await mapTechnologyToAdmin(raw, this.mediaService);
    return {
      message: 'Technology updated successfully',
      data: mapped,
    };
  }

  @Patch(':id/publish')
  async publish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.technologiesService.publish(id, true, req);
    const mapped = await mapTechnologyToAdmin(raw, this.mediaService);
    return {
      message: 'Technology published successfully',
      data: mapped,
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.technologiesService.publish(id, false, req);
    const mapped = await mapTechnologyToAdmin(raw, this.mediaService);
    return {
      message: 'Technology unpublished successfully',
      data: mapped,
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
