import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FilterFaqDto } from './dto/filter-faq.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Public()
@Controller('public/faqs')
export class PublicFaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  async findAll(@Query() filterDto: FilterFaqDto) {
    const result = await this.faqsService.findAllPublic(filterDto);
    return {
      message: 'FAQs loaded successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'FAQ loaded successfully',
      data: await this.faqsService.findOnePublic(id),
    };
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
@Controller('admin/faqs')
export class AdminFaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  async findAll(@Query() filterDto: FilterFaqDto) {
    const result = await this.faqsService.findAllAdmin(filterDto);
    return {
      message: 'FAQs loaded successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'FAQ loaded successfully',
      data: await this.faqsService.findOneAdmin(id),
    };
  }

  @Post()
  async create(@Request() req, @Body() dto: CreateFaqDto) {
    return {
      message: 'FAQ created successfully',
      data: await this.faqsService.create(dto, req),
    };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateFaqDto,
  ) {
    return {
      message: 'FAQ updated successfully',
      data: await this.faqsService.update(id, dto, req),
    };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    await this.faqsService.remove(id, req);
    return { message: 'FAQ deleted successfully', data: null };
  }
}
