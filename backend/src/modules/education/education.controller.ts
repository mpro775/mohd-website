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
import { BulkEducationActionDto } from './dto/bulk-education-action.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { FilterEducationDto } from './dto/filter-education.dto';
import { ReorderEducationDto } from './dto/reorder-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import {
  mapEducationListToAdmin,
  mapEducationListToPublic,
  mapEducationToAdmin,
  mapEducationToPublic,
} from './mappers/education.mapper';
import { EducationService } from './education.service';

@Public()
@Controller('public/education')
export class PublicEducationController {
  constructor(
    private readonly service: EducationService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(@Query() query: FilterEducationDto) {
    const result = await this.service.findAllPublic(query);
    return {
      message: 'Education loaded successfully',
      data: await mapEducationListToPublic(result.data, this.mediaService),
      meta: result.meta,
    };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const item = await this.service.findOnePublic(slug);
    return {
      message: 'Education item loaded successfully',
      data: await mapEducationToPublic(item, this.mediaService),
    };
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
@Controller('admin/education')
export class AdminEducationController {
  constructor(
    private readonly service: EducationService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(@Query() query: FilterEducationDto) {
    const result = await this.service.findAllAdmin(query);
    return {
      message: 'Education loaded successfully',
      data: await mapEducationListToAdmin(result.data, this.mediaService),
      meta: result.meta,
    };
  }

  @Post()
  async create(@Request() request: unknown, @Body() dto: CreateEducationDto) {
    const item = await this.service.create(dto, request);
    return {
      message: 'Education item created successfully',
      data: await mapEducationToAdmin(item, this.mediaService),
    };
  }

  @Patch('reorder')
  async reorder(@Request() request: unknown, @Body() dto: ReorderEducationDto) {
    return {
      message: 'Education reordered successfully',
      data: await this.service.reorder(dto, request),
    };
  }

  @Post('bulk')
  async bulk(@Request() request: unknown, @Body() dto: BulkEducationActionDto) {
    return {
      message: 'Education bulk action completed successfully',
      data: await this.service.bulkAction(dto, request),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const item = await this.service.findOneAdmin(id);
    return {
      message: 'Education item loaded successfully',
      data: await mapEducationToAdmin(item, this.mediaService),
    };
  }

  @Put(':id')
  async update(
    @Request() request: unknown,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateEducationDto,
  ) {
    const item = await this.service.update(id, dto, request);
    return {
      message: 'Education item updated successfully',
      data: await mapEducationToAdmin(item, this.mediaService),
    };
  }

  @Patch(':id/publish')
  async publish(
    @Request() request: unknown,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    const item = await this.service.setPublished(id, true, request);
    return {
      message: 'Education item published successfully',
      data: await mapEducationToAdmin(item, this.mediaService),
    };
  }

  @Patch(':id/unpublish')
  async unpublish(
    @Request() request: unknown,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    const item = await this.service.setPublished(id, false, request);
    return {
      message: 'Education item unpublished successfully',
      data: await mapEducationToAdmin(item, this.mediaService),
    };
  }

  @Patch(':id/feature')
  async feature(
    @Request() request: unknown,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    const item = await this.service.setFeatured(id, true, request);
    return {
      message: 'Education item featured successfully',
      data: await mapEducationToAdmin(item, this.mediaService),
    };
  }

  @Patch(':id/unfeature')
  async unfeature(
    @Request() request: unknown,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    const item = await this.service.setFeatured(id, false, request);
    return {
      message: 'Education item unfeatured successfully',
      data: await mapEducationToAdmin(item, this.mediaService),
    };
  }

  @Delete(':id')
  async remove(
    @Request() request: unknown,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    await this.service.remove(id, request);
    return { message: 'Education item deleted successfully', data: null };
  }
}
