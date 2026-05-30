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
import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-object-id.pipe';

@Public()
@Controller(['public/blog/posts', 'blog/posts'])
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

@UseGuards(JwtAuthGuard)
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
      data: await this.postsService.create(createPostDto, req.user.userId),
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return {
      message: 'Post updated successfully',
      data: await this.postsService.update(id, updatePostDto),
    };
  }

  @Patch(':id/publish')
  async publish(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Post published successfully',
      data: await this.postsService.setStatus(id, PostStatus.PUBLISHED),
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Post unpublished successfully',
      data: await this.postsService.setStatus(id, PostStatus.DRAFT),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.postsService.remove(id);
    return { message: 'Post deleted successfully', data: null };
  }
}
