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
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { FilterLinkDto } from './dto/filter-link.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { MediaService } from '../media/media.service';
import { mapLinkToPublic, mapLinkToAdmin } from './mappers/link.mapper';

@Public()
@Controller('public/links')
export class PublicLinksController {
  constructor(
    private readonly linksService: LinksService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    const rawList = await this.linksService.findAll(category);
    const mappedList = await Promise.all(
      rawList.map((item) => mapLinkToPublic(item, this.mediaService)),
    );
    return {
      message: 'Links loaded successfully',
      data: mappedList,
    };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const raw = await this.linksService.findOne(slug);
    const mapped = await mapLinkToPublic(raw, this.mediaService);
    return {
      message: 'Link loaded successfully',
      data: mapped,
    };
  }

  @Post(':id/click')
  async trackClick(@Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.linksService.trackClick(id);
    const mapped = await mapLinkToPublic(raw, this.mediaService);
    return {
      message: 'Link click tracked successfully',
      data: mapped,
    };
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Permission.MANAGE_PORTFOLIO)
@Controller('admin/links')
export class AdminLinksController {
  constructor(
    private readonly linksService: LinksService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(@Query() query: FilterLinkDto) {
    const result = await this.linksService.findAllAdmin(query);
    const mappedData = await Promise.all(
      result.data.map((item) => mapLinkToAdmin(item, this.mediaService)),
    );
    return {
      message: 'Links loaded successfully',
      data: mappedData,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.linksService.findOneAdmin(id);
    const mapped = await mapLinkToAdmin(raw, this.mediaService);
    return {
      message: 'Link loaded successfully',
      data: mapped,
    };
  }

  @Post()
  async create(@Request() req, @Body() createLinkDto: CreateLinkDto) {
    const raw = await this.linksService.create(createLinkDto, req);
    const mapped = await mapLinkToAdmin(raw, this.mediaService);
    return {
      message: 'Link created successfully',
      data: mapped,
    };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateLinkDto: UpdateLinkDto,
  ) {
    const raw = await this.linksService.update(id, updateLinkDto, req);
    const mapped = await mapLinkToAdmin(raw, this.mediaService);
    return {
      message: 'Link updated successfully',
      data: mapped,
    };
  }

  @Patch(':id/publish')
  async publish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.linksService.publish(id, true, req);
    const mapped = await mapLinkToAdmin(raw, this.mediaService);
    return {
      message: 'Link published successfully',
      data: mapped,
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.linksService.publish(id, false, req);
    const mapped = await mapLinkToAdmin(raw, this.mediaService);
    return {
      message: 'Link unpublished successfully',
      data: mapped,
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
