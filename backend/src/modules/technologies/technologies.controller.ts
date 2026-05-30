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
import { TechnologiesService } from './technologies.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Public()
@Controller(['public/technologies', 'technologies'])
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

@UseGuards(JwtAuthGuard)
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
  async create(@Body() createTechnologyDto: CreateTechnologyDto) {
    return {
      message: 'Technology created successfully',
      data: await this.technologiesService.create(createTechnologyDto),
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateTechnologyDto: UpdateTechnologyDto,
  ) {
    return {
      message: 'Technology updated successfully',
      data: await this.technologiesService.update(id, updateTechnologyDto),
    };
  }

  @Patch(':id/publish')
  async publish(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Technology published successfully',
      data: await this.technologiesService.publish(id, true),
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Technology unpublished successfully',
      data: await this.technologiesService.publish(id, false),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.technologiesService.remove(id);
    return { message: 'Technology deleted successfully', data: null };
  }
}
