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
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Public()
@Controller(['public/links', 'links'])
export class PublicLinksController {
  constructor(private readonly linksService: LinksService) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    return {
      message: 'Links loaded successfully',
      data: await this.linksService.findAll(category),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Link loaded successfully',
      data: await this.linksService.findOne(id),
    };
  }

  @Post(':id/click')
  async trackClick(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Link click tracked successfully',
      data: await this.linksService.trackClick(id),
    };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/links')
export class AdminLinksController {
  constructor(private readonly linksService: LinksService) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    return {
      message: 'Links loaded successfully',
      data: await this.linksService.findAllAdmin(category),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Link loaded successfully',
      data: await this.linksService.findOneAdmin(id),
    };
  }

  @Post()
  async create(@Body() createLinkDto: CreateLinkDto) {
    return {
      message: 'Link created successfully',
      data: await this.linksService.create(createLinkDto),
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateLinkDto: UpdateLinkDto,
  ) {
    return {
      message: 'Link updated successfully',
      data: await this.linksService.update(id, updateLinkDto),
    };
  }

  @Patch(':id/publish')
  async publish(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Link published successfully',
      data: await this.linksService.publish(id, true),
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Link unpublished successfully',
      data: await this.linksService.publish(id, false),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.linksService.remove(id);
    return { message: 'Link deleted successfully', data: null };
  }
}
