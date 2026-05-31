import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-object-id.pipe';

@Public()
@Controller('public/blog/categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    const categories = await this.categoriesService.findAllPublic();
    return {
      message: 'تم جلب التصنيفات بنجاح',
      data: categories,
    };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const category = await this.categoriesService.findOnePublic(slug);
    return {
      message: 'تم جلب التصنيف بنجاح',
      data: category,
    };
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
@Controller('admin/blog/categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    const categories = await this.categoriesService.findAllAdmin();
    return {
      message: 'تم جلب التصنيفات بنجاح',
      data: categories,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const category = await this.categoriesService.findOneAdmin(id);
    return {
      message: 'تم جلب التصنيف بنجاح',
      data: category,
    };
  }

  @Post()
  async create(@Request() req, @Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(
      createCategoryDto,
      req,
    );
    return {
      message: 'تم إنشاء التصنيف بنجاح',
      data: category,
    };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(
      id,
      updateCategoryDto,
      req,
    );
    return {
      message: 'تم تحديث التصنيف بنجاح',
      data: category,
    };
  }

  @Patch(':id/activate')
  async activate(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const category = await this.categoriesService.setStatus(id, true, req);
    return {
      message: 'تم تفعيل التصنيف بنجاح',
      data: category,
    };
  }

  @Patch(':id/deactivate')
  async deactivate(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const category = await this.categoriesService.setStatus(id, false, req);
    return {
      message: 'تم إلغاء تفعيل التصنيف بنجاح',
      data: category,
    };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    await this.categoriesService.remove(id, req);
    return {
      message: 'تم حذف التصنيف بنجاح',
      data: null,
    };
  }
}
