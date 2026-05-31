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
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Public()
@Controller('public/links')
export class PublicLinksController {
  constructor(private readonly linksService: LinksService) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    return {
      message: 'Links loaded successfully',
      data: await this.linksService.findAll(category),
    };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return {
      message: 'Link loaded successfully',
      data: await this.linksService.findOne(slug),
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

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
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
  async create(@Request() req, @Body() createLinkDto: CreateLinkDto) {
    return {
      message: 'Link created successfully',
      data: await this.linksService.create(createLinkDto, req),
    };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateLinkDto: UpdateLinkDto,
  ) {
    return {
      message: 'Link updated successfully',
      data: await this.linksService.update(id, updateLinkDto, req),
    };
  }

  @Patch(':id/publish')
  async publish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Link published successfully',
      data: await this.linksService.publish(id, true, req),
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Link unpublished successfully',
      data: await this.linksService.publish(id, false, req),
    };
  }

  @Patch('reorder')
  async reorder(
    @Request() req,
    @Body() body: { items: { id: string; order: number }[] },
  ) {
    await this.linksService.reorder(body.items || [], req);
    return { message: 'Links reordered successfully', data: null };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    await this.linksService.remove(id, req);
    return { message: 'Link deleted successfully', data: null };
  }
}
