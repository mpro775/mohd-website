import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('blog/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Public()
  @Get()
  async findAll() {
    const tags = await this.tagsService.findAll();
    return {
      message: 'تم جلب الوسوم بنجاح',
      data: tags,
    };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tag = await this.tagsService.findOne(id);
    return {
      message: 'تم جلب الوسم بنجاح',
      data: tag,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    const tag = await this.tagsService.create(createTagDto);
    return {
      message: 'تم إنشاء الوسم بنجاح',
      data: tag,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    const tag = await this.tagsService.update(id, updateTagDto);
    return {
      message: 'تم تحديث الوسم بنجاح',
      data: tag,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tagsService.remove(id);
    return {
      message: 'تم حذف الوسم بنجاح',
      data: null,
    };
  }
}
