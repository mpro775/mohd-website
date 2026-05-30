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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Public()
@Controller(['public/projects', 'projects'])
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

@UseGuards(JwtAuthGuard)
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
  async create(@Body() createProjectDto: CreateProjectDto) {
    return {
      message: 'Project created successfully',
      data: await this.projectsService.create(createProjectDto),
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return {
      message: 'Project updated successfully',
      data: await this.projectsService.update(id, updateProjectDto),
    };
  }

  @Patch(':id/publish')
  async publish(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Project published successfully',
      data: await this.projectsService.publish(id, true),
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Project unpublished successfully',
      data: await this.projectsService.publish(id, false),
    };
  }

  @Patch('reorder')
  async reorder(@Body() body: { items: { id: string; order: number }[] }) {
    await this.projectsService.reorder(body.items || []);
    return { message: 'Projects reordered successfully', data: null };
  }

  @Delete(':id')
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.projectsService.remove(id);
    return { message: 'Project archived successfully', data: null };
  }
}
