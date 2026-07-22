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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';
import { BulkActionDto } from '../../common/dto/bulk-action.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { MediaService } from '../media/media.service';
import { TechnologiesService } from '../technologies/technologies.service';
import {
  mapProjectToPublic,
  mapProjectToAdmin,
} from './mappers/project.mapper';

@Public()
@Controller('public/projects')
export class PublicProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly mediaService: MediaService,
    private readonly technologiesService: TechnologiesService,
  ) {}

  @Get()
  async findAll(@Query() filterDto: FilterProjectDto) {
    const result = await this.projectsService.findAllPublic(filterDto);
    const mappedData = await Promise.all(
      result.data.map((item) =>
        mapProjectToPublic(item, this.mediaService, this.technologiesService),
      ),
    );
    return {
      message: 'Projects loaded successfully',
      data: mappedData,
      meta: result.meta,
    };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const raw = await this.projectsService.findOnePublic(slug);
    const mapped = await mapProjectToPublic(
      raw,
      this.mediaService,
      this.technologiesService,
    );
    return {
      message: 'Project loaded successfully',
      data: mapped,
    };
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Permission.MANAGE_PORTFOLIO)
@Controller('admin/projects')
export class AdminProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly mediaService: MediaService,
    private readonly technologiesService: TechnologiesService,
  ) {}

  @Get()
  async findAll(@Query() filterDto: FilterProjectDto) {
    const result = await this.projectsService.findAllAdmin(filterDto);
    const mappedData = await Promise.all(
      result.data.map((item) =>
        mapProjectToAdmin(item, this.mediaService, this.technologiesService),
      ),
    );
    return {
      message: 'Projects loaded successfully',
      data: mappedData,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.projectsService.findOneAdmin(id);
    const mapped = await mapProjectToAdmin(
      raw,
      this.mediaService,
      this.technologiesService,
    );
    return {
      message: 'Project loaded successfully',
      data: mapped,
    };
  }

  @Post()
  async create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
    const raw = await this.projectsService.create(createProjectDto, req);
    const mapped = await mapProjectToAdmin(
      raw,
      this.mediaService,
      this.technologiesService,
    );
    return {
      message: 'Project created successfully',
      data: mapped,
    };
  }

  @Post('bulk')
  async bulk(@Request() req, @Body() dto: BulkActionDto) {
    await this.projectsService.bulkAction(dto, req);
    return {
      message: 'Bulk action completed successfully',
      data: null,
    };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const raw = await this.projectsService.update(id, updateProjectDto, req);
    const mapped = await mapProjectToAdmin(
      raw,
      this.mediaService,
      this.technologiesService,
    );
    return {
      message: 'Project updated successfully',
      data: mapped,
    };
  }

  @Patch(':id/publish')
  async publish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.projectsService.publish(id, true, req);
    const mapped = await mapProjectToAdmin(
      raw,
      this.mediaService,
      this.technologiesService,
    );
    return {
      message: 'Project published successfully',
      data: mapped,
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.projectsService.publish(id, false, req);
    const mapped = await mapProjectToAdmin(
      raw,
      this.mediaService,
      this.technologiesService,
    );
    return {
      message: 'Project unpublished successfully',
      data: mapped,
    };
  }

  @Patch('reorder')
  async reorder(
    @Request() req,
    @Body() body: { items: { id: string; order: number }[] },
  ) {
    await this.projectsService.reorder(body.items || [], req);
    return { message: 'Projects reordered successfully', data: null };
  }

  @Patch(':id/archive')
  async archive(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    await this.projectsService.remove(id, req);
    return { message: 'Project archived successfully', data: null };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    await this.projectsService.remove(id, req);
    return { message: 'Project archived successfully', data: null };
  }
}
