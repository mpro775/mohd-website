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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { FilterTagDto } from './dto/filter-tag.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-object-id.pipe';

@Public()
@Controller('public/blog/tags')
export class PublicTagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async findAll() {
    const tags = await this.tagsService.findAllPublic();
    return {
      message: 'تم جلب الوسوم بنجاح',
      data: tags,
    };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const tag = await this.tagsService.findOnePublic(slug);
    return {
      message: 'تم جلب الوسم بنجاح',
      data: tag,
    };
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
@Controller('admin/blog/tags')
export class AdminTagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async findAll(@Query() query: FilterTagDto) {
    const result = await this.tagsService.findAllAdmin(query);
    return {
      message: 'تم جلب الوسوم بنجاح',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const tag = await this.tagsService.findOneAdmin(id);
    return {
      message: 'تم جلب الوسم بنجاح',
      data: tag,
    };
  }

  @Post()
  async create(@Request() req, @Body() createTagDto: CreateTagDto) {
    const tag = await this.tagsService.create(createTagDto, req);
    return {
      message: 'تم إنشاء الوسم بنجاح',
      data: tag,
    };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    const tag = await this.tagsService.update(id, updateTagDto, req);
    return {
      message: 'تم تحديث الوسم بنجاح',
      data: tag,
    };
  }

  @Patch(':id/activate')
  async activate(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const tag = await this.tagsService.setStatus(id, true, req);
    return {
      message: 'تم تفعيل الوسم بنجاح',
      data: tag,
    };
  }

  @Patch(':id/deactivate')
  async deactivate(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const tag = await this.tagsService.setStatus(id, false, req);
    return {
      message: 'تم إلغاء تفعيل الوسم بنجاح',
      data: tag,
    };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    await this.tagsService.remove(id, req);
    return {
      message: 'تم حذف الوسم بنجاح',
      data: null,
    };
  }
}
