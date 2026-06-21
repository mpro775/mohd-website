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
import { MediaService } from '../../media/media.service';
import { mapPostToPublic, mapPostToAdmin } from './mappers/post.mapper';

@Public()
@Controller('public/blog/posts')
export class PublicPostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(@Query() filterDto: FilterPostDto) {
    const result = await this.postsService.findAllPublic(filterDto);
    const mappedData = await Promise.all(
      result.data.map((item) => mapPostToPublic(item, this.mediaService)),
    );
    return {
      message: 'Posts loaded successfully',
      data: mappedData,
      meta: result.meta,
    };
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const raw = await this.postsService.findBySlugPublic(slug);
    const mapped = await mapPostToPublic(raw, this.mediaService);
    return {
      message: 'Post loaded successfully',
      data: mapped,
    };
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
@Controller('admin/blog/posts')
export class AdminPostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(@Query() filterDto: FilterPostDto) {
    const result = await this.postsService.findAllAdmin(filterDto);
    const mappedData = await Promise.all(
      result.data.map((item) => mapPostToAdmin(item, this.mediaService)),
    );
    return {
      message: 'Posts loaded successfully',
      data: mappedData,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.postsService.findOneAdmin(id);
    const mapped = await mapPostToAdmin(raw, this.mediaService);
    return {
      message: 'Post loaded successfully',
      data: mapped,
    };
  }

  @Post()
  async create(@Request() req, @Body() createPostDto: CreatePostDto) {
    const raw = await this.postsService.create(createPostDto, req.user.userId, req);
    const mapped = await mapPostToAdmin(raw, this.mediaService);
    return {
      message: 'Post created successfully',
      data: mapped,
    };
  }

  @Post('bulk')
  async bulk(@Request() req, @Body() dto: BulkActionDto) {
    await this.postsService.bulkAction(dto, req);
    return {
      message: 'Bulk action completed successfully',
      data: null,
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
    const raw = await this.postsService.update(id, updatePostDto, req);
    const mapped = await mapPostToAdmin(raw, this.mediaService);
    return {
      message: 'Post updated successfully',
      data: mapped,
    };
  }

  @Patch(':id/publish')
  async publish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.postsService.setStatus(id, PostStatus.PUBLISHED, req);
    const mapped = await mapPostToAdmin(raw, this.mediaService);
    return {
      message: 'Post published successfully',
      data: mapped,
    };
  }

  @Patch(':id/unpublish')
  async unpublish(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.postsService.setStatus(id, PostStatus.DRAFT, req);
    const mapped = await mapPostToAdmin(raw, this.mediaService);
    return {
      message: 'Post unpublished successfully',
      data: mapped,
    };
  }

  @Patch(':id/archive')
  async archive(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    const raw = await this.postsService.archive(id, req);
    const mapped = await mapPostToAdmin(raw, this.mediaService);
    return {
      message: 'Post archived successfully',
      data: mapped,
    };
  }

  @Patch(':id/schedule')
  async schedule(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: { publishDate: string },
  ) {
    const raw = await this.postsService.schedule(
      id,
      new Date(body.publishDate),
      req,
    );
    const mapped = await mapPostToAdmin(raw, this.mediaService);
    return {
      message: 'Post scheduled successfully',
      data: mapped,
    };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseObjectIdPipe) id: string) {
    await this.postsService.remove(id, req);
    return { message: 'Post deleted successfully', data: null };
  }
}
