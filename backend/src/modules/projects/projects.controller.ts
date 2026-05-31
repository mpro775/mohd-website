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
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Public()
@Controller('public/projects')
export class PublicProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@Query() filterDto: FilterProjectDto) {
    const result = await this.projectsService.findAllPublic(filterDto);
    return {
      message: 'Projects loaded successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return {
      message: 'Project loaded successfully',
      data: await this.projectsService.findOnePublic(slug),
    };
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
@Controller('admin/projects')
export class AdminProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@Query() filterDto: FilterProjectDto) {
    const result = await this.projectsService.findAllAdmin(filterDto);
    return {
      message: 'Projects loaded successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Project loaded successfully',
      data: await this.projectsService.findOneAdmin(id),
    };
  }

  @Post()
  async create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
    return {
      message: 'Project created successfully',
      data: await this.projectsService.create(createProjectDto, req),
    };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return {
      message: 'Project updated successfully',
      data: await this.projectsService.update(id, updateProjectDto, req),
    };
  }

  @Patch(':id/publish')
  async publish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Project published successfully',
      data: await this.projectsService.publish(id, true, req),
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Project unpublished successfully',
      data: await this.projectsService.publish(id, false, req),
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
