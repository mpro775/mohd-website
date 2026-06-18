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
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';
import { PostStatus } from './schemas/post.schema';
import { BulkActionDto } from '../../../common/dto/bulk-action.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-object-id.pipe';

@Public()
@Controller('public/blog/posts')
export class PublicPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(@Query() filterDto: FilterPostDto) {
    const result = await this.postsService.findAllPublic(filterDto);
    return {
      message: 'Posts loaded successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return {
      message: 'Post loaded successfully',
      data: await this.postsService.findBySlugPublic(slug),
    };
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
@Controller('admin/blog/posts')
export class AdminPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(@Query() filterDto: FilterPostDto) {
    const result = await this.postsService.findAllAdmin(filterDto);
    return {
      message: 'Posts loaded successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Post loaded successfully',
      data: await this.postsService.findOneAdmin(id),
    };
  }

  @Post()
  async create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return {
      message: 'Post created successfully',
      data: await this.postsService.create(createPostDto, req.user.userId, req),
    };
  }

  @Post('bulk')
  async bulk(@Request() req, @Body() dto: BulkActionDto) {
    return {
      message: 'Bulk action completed successfully',
      data: await this.postsService.bulkAction(dto, req),
    };
  }

  @Post('publish-due')
  async publishDue() {
    return {
      message: 'Due scheduled posts published successfully',
      data: await this.postsService.publishDueScheduledPosts(),
    };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return {
      message: 'Post updated successfully',
      data: await this.postsService.update(id, updatePostDto, req),
    };
  }

  @Patch(':id/publish')
  async publish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Post published successfully',
      data: await this.postsService.setStatus(id, PostStatus.PUBLISHED, req),
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Post unpublished successfully',
      data: await this.postsService.setStatus(id, PostStatus.DRAFT, req),
    };
  }

  @Patch(':id/archive')
  async archive(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Post archived successfully',
      data: await this.postsService.archive(id, req),
    };
  }

  @Patch(':id/schedule')
  async schedule(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: { publishDate: string },
  ) {
    return {
      message: 'Post scheduled successfully',
      data: await this.postsService.schedule(
        id,
        new Date(body.publishDate),
        req,
      ),
    };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    await this.postsService.remove(id, req);
    return { message: 'Post deleted successfully', data: null };
  }
}
